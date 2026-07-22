const OPENAI_API_KEY = Bun.env.OPENAI_API_KEY;

const PORT = 3001;

// ── Allowed CORS origins ─────────────────────────────────────

const ALLOWED_ORIGINS = [
  "http://localhost:5173",   // Vite dev server
  "http://localhost:3000",   // local preview
  "https://site-pm3hw28c3-fit-check1.vercel.app",  // Vercel deploy
  "https://attired.ctonew.app",  // production
];

// ── Rate limiter ─────────────────────────────────────────────

const RATE_LIMIT = 30;         // requests per window
const RATE_WINDOW_MS = 60_000;  // 1 minute
const STALE_CLEANUP_MS = 300_000; // clean up stale entries every 5 min

const rateMap = new Map<
  string,
  { count: number; resetAt: number }
>();

let lastCleanup = Date.now();

function getClientIp(req: Request): string {
  // Check common proxy/forward headers first, fall back to no host
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function rateLimitCheck(ip: string): boolean {
  const now = Date.now();

  // Periodic cleanup of stale entries
  if (now - lastCleanup > STALE_CLEANUP_MS) {
    for (const [key, entry] of rateMap) {
      if (now > entry.resetAt) {
        rateMap.delete(key);
      }
    }
    lastCleanup = now;
  }

  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    // First request in this window (or window expired)
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false; // rate limited
  }

  entry.count++;
  return true;
}

// ── Shared helpers ──────────────────────────────────────────

function parseJsonFromContent(content: string): unknown {
  const jsonStr = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(jsonStr);
}

const VALID_CATEGORIES = [
  "top",
  "bottom",
  "dress",
  "outerwear",
  "shoes",
  "accessory",
] as const;

function validCategory(c: unknown): string {
  const s = String(c || "top").toLowerCase();
  return VALID_CATEGORIES.includes(s as typeof VALID_CATEGORIES[number])
    ? s
    : "top";
}

// ── CORS headers ────────────────────────────────────────────

function getAllowedOrigin(requestOrigin: string | null): string | null {
  if (!requestOrigin) return null;
  // Check exact match against allowed list
  if (ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }
  return null; // deny
}

function corsHeaders(req?: Request): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req) {
    const origin = req.headers.get("origin");
    const allowed = getAllowedOrigin(origin);
    if (allowed) {
      headers["Access-Control-Allow-Origin"] = allowed;
    }
    // If origin not in whitelist, omit the header entirely → deny
  }

  return headers;
}

// ── Input validation helpers ─────────────────────────────────

const MAX_ITEMS = 50;
const MAX_IMAGE_CHARS = 14_000_000; // ~10.5MB base64, well under 10MB decoded

function validateImageDataUrl(dataUrl: unknown): string | null {
  if (typeof dataUrl !== "string") return "imageDataUrl must be a string";
  if (!dataUrl.startsWith("data:image/")) return "imageDataUrl must be a data:image/* URL";
  if (dataUrl.length > MAX_IMAGE_CHARS) return "imageDataUrl exceeds maximum size (10MB)";
  return null; // valid
}

// ── /api/analyze ────────────────────────────────────────────

const ANALYSIS_PROMPT = `Analyze this clothing item in detail. Return ONLY a JSON object (no markdown, no code fences, no extra text) with these fields:
- "category": one of "top", "bottom", "dress", "outerwear", "shoes", "accessory"
- "subcategory": specific type (e.g. "t-shirt", "jeans", "blazer", "sneakers", "necklace")
- "color": primary color name
- "pattern": one of "solid", "striped", "floral", "plaid", "polka dot", "color block", "graphic", "animal print", "other"
- "styleTags": array of 2-4 style tags like "casual", "formal", "vintage", "streetwear", "preppy", "boho", "minimal", "edgy", "romantic", "athleisure"
- "seasonality": array of applicable seasons from ["spring", "summer", "fall", "winter"]

Example response:
{"category":"top","subcategory":"t-shirt","color":"navy","pattern":"solid","styleTags":["casual","minimal"],"seasonality":["spring","summer","fall"]}`;

function fallbackAnalysis() {
  return {
    category: "top",
    subcategory: "unknown",
    color: "unknown",
    pattern: "solid",
    styleTags: ["casual"],
    seasonality: ["all"],
  };
}

async function handleAnalyze(req: Request): Promise<Response> {
  try {
    const { imageDataUrl } = (await req.json()) as { imageDataUrl?: string };

    if (!imageDataUrl) {
      return Response.json(
        { error: "imageDataUrl required" },
        { status: 400, headers: corsHeaders(req) },
      );
    }

    // Validate image data URL
    const imageError = validateImageDataUrl(imageDataUrl);
    if (imageError) {
      return Response.json(
        { error: imageError },
        { status: 400, headers: corsHeaders(req) },
      );
    }

    if (!OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not set — returning fallback analysis");
      return Response.json(fallbackAnalysis(), { headers: corsHeaders(req) });
    }

    const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: ANALYSIS_PROMPT },
              {
                type: "image_url",
                image_url: { url: imageDataUrl, detail: "low" },
              },
            ],
          },
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!openaiResp.ok) {
      const errorText = await openaiResp.text();
      console.error(
        `OpenAI API error (${openaiResp.status}): ${errorText.slice(0, 200)}`,
      );
      return Response.json(fallbackAnalysis(), { headers: corsHeaders(req) });
    }

    const data = (await openaiResp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("OpenAI API returned empty content");
      return Response.json(fallbackAnalysis(), { headers: corsHeaders(req) });
    }

    const parsed = parseJsonFromContent(content) as Record<string, unknown>;

    return Response.json(
      {
        category: validCategory(parsed.category),
        subcategory: String(parsed.subcategory || "unknown").toLowerCase(),
        color: String(parsed.color || "unknown").toLowerCase(),
        pattern: String(parsed.pattern || "solid").toLowerCase(),
        styleTags: Array.isArray(parsed.styleTags)
          ? parsed.styleTags.slice(0, 4).map((t: unknown) => String(t).toLowerCase())
          : ["casual"],
        seasonality: Array.isArray(parsed.seasonality)
          ? parsed.seasonality.map((s: unknown) => String(s).toLowerCase())
          : ["all"],
      },
      { headers: corsHeaders(req) },
    );
  } catch (err) {
    console.error("Analyze error:", err);
    return Response.json(fallbackAnalysis(), { headers: corsHeaders(req) });
  }
}

// ── /api/outfits ────────────────────────────────────────────

interface ItemForPrompt {
  id: string;
  category: string;
  subcategory: string;
  color: string;
  pattern: string;
  styleTags: string[];
  seasonality: string[];
}

function buildPrompt(items: ItemForPrompt[], occasion: string): string {
  const itemList = items
    .map(
      (item, i) =>
        `${i + 1}. [id: ${item.id}] ${item.color} ${item.pattern} ${item.subcategory} ` +
        `(${item.category}) — style: ${item.styleTags.join(", ")}, ` +
        `seasons: ${item.seasonality.join(", ")}`,
    )
    .join("\n");

  return `You are a professional fashion stylist. A user needs outfit combinations for: "${occasion}".

Their wardrobe contains these items:
${itemList}

Create 3-5 outfit combinations using ONLY the items listed above (reference them by their id). Each outfit should use 2-5 complementary items.

Return ONLY a JSON array (no markdown, no code fences, no extra text) of outfit objects, each with:
- "name": a catchy, fun name for the outfit (e.g. "Sunset Stroll", "Boardroom Boss")
- "itemIds": array of the item IDs used from the list above
- "description": one sentence explaining why this combination works for the occasion
- "vibeRating": number 1-5 rating the overall vibe

Example response:
[{"name":"Effortless Brunch","itemIds":["item-1","item-4","item-7"],"description":"The relaxed linen top balances the structured trousers for an elevated yet comfortable brunch look.","vibeRating":4}]`;
}

function fallbackOutfits(items: ItemForPrompt[], occasion: string) {
  if (items.length === 0) return [];

  const tops = items.filter(
    (i) =>
      i.category === "top" || i.category === "outerwear" || i.category === "dress",
  );
  const bottoms = items.filter((i) => i.category === "bottom");
  const shoes = items.filter((i) => i.category === "shoes");
  const accessories = items.filter((i) => i.category === "accessory");

  const occasionMoods: Record<string, string[]> = {
    "date night": ["romantic", "sleek", "confident"],
    "job interview": ["polished", "professional", "sharp"],
    brunch: ["effortless", "fresh", "chic"],
    "casual friday": ["relaxed", "cool", "easygoing"],
    "night out": ["bold", "daring", "head-turning"],
    "wedding guest": ["elegant", "refined", "celebratory"],
  };

  const moods = occasionMoods[occasion.toLowerCase()] ?? [
    "stylish",
    "put-together",
    "fun",
  ];

  const names = [
    "The Statement Look",
    "Effortless Charm",
    "Polished Edge",
    "Quiet Confidence",
    "Weekend Ready",
  ];
  const descriptions = [
    "This combo strikes the perfect balance between comfort and style for the occasion.",
    "A thoughtfully paired look that lets each piece shine.",
    "These pieces work together to create a cohesive, intentional outfit.",
    "Simple but effective — the colors and silhouettes complement each other beautifully.",
    "An easy win from your closet that feels fresh and current.",
  ];

  const combos: Array<{
    id: string;
    name: string;
    itemIds: string[];
    description: string;
    vibeRating: number;
  }> = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < Math.min(5, items.length); i++) {
    const outfitIds: string[] = [];

    const top = tops.find((t) => !usedIds.has(t.id)) ?? tops[0];
    if (top && !usedIds.has(top.id)) {
      outfitIds.push(top.id);
      usedIds.add(top.id);
    }

    if (
      !items.find(
        (it) => it.id === outfitIds[0] && it.category === "dress",
      )
    ) {
      const bottom =
        bottoms.find((b) => !usedIds.has(b.id)) ?? bottoms[0];
      if (bottom && !usedIds.has(bottom.id)) {
        outfitIds.push(bottom.id);
        usedIds.add(bottom.id);
      }
    }

    const shoe = shoes.find((s) => !usedIds.has(s.id)) ?? shoes[0];
    if (shoe && !usedIds.has(shoe.id)) {
      outfitIds.push(shoe.id);
      usedIds.add(shoe.id);
    }

    if (Math.random() > 0.4) {
      const acc = accessories.find((a) => !usedIds.has(a.id));
      if (acc) {
        outfitIds.push(acc.id);
        usedIds.add(acc.id);
      }
    }

    if (outfitIds.length === 0) {
      const any = items.find((it) => !usedIds.has(it.id));
      if (any) {
        outfitIds.push(any.id);
        usedIds.add(any.id);
      }
    }

    if (outfitIds.length > 0) {
      combos.push({
        id: `outfit-${i + 1}`,
        name: names[i % names.length],
        itemIds: outfitIds,
        description: `${
          moods[i % moods.length].charAt(0).toUpperCase() +
          moods[i % moods.length].slice(1)
        } — ${descriptions[i % descriptions.length]}`,
        vibeRating: Math.min(5, 3 + Math.floor(Math.random() * 3)),
      });
    }

    if (usedIds.size >= items.length * 0.8) {
      usedIds.clear();
    }
  }

  return combos.map((c) => ({ ...c, occasion }));
}

async function handleOutfits(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as {
      items?: ItemForPrompt[];
      occasion?: string;
    };

    const { items = [], occasion = "casual" } = body;

    // Validate items array size
    if (!Array.isArray(items)) {
      return Response.json(
        { error: "items must be an array" },
        { status: 400, headers: corsHeaders(req) },
      );
    }

    if (items.length > MAX_ITEMS) {
      return Response.json(
        { error: `items array exceeds maximum of ${MAX_ITEMS} items` },
        { status: 400, headers: corsHeaders(req) },
      );
    }

    if (items.length === 0) {
      return Response.json(fallbackOutfits(items, occasion), {
        headers: corsHeaders(req),
      });
    }

    if (!OPENAI_API_KEY) {
      console.warn(
        "OPENAI_API_KEY not set — using fallback outfit generation",
      );
      return Response.json(fallbackOutfits(items, occasion), {
        headers: corsHeaders(req),
      });
    }

    const openaiResp = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: buildPrompt(items, occasion),
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      },
    );

    if (!openaiResp.ok) {
      const errorText = await openaiResp.text();
      console.error(
        `OpenAI API error (${openaiResp.status}): ${errorText.slice(0, 200)}`,
      );
      return Response.json(fallbackOutfits(items, occasion), {
        headers: corsHeaders(req),
      });
    }

    const data = (await openaiResp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("OpenAI API returned empty content");
      return Response.json(fallbackOutfits(items, occasion), {
        headers: corsHeaders(req),
      });
    }

    const parsed = parseJsonFromContent(content);

    if (!Array.isArray(parsed)) {
      throw new Error("Expected an array of outfits");
    }

    const validIds = new Set(items.map((item) => item.id));
    let idCounter = 1;

    const outfits = parsed.slice(0, 5).map((o: unknown) => {
      const obj = o as Record<string, unknown>;
      const rawIds: string[] = Array.isArray(obj.itemIds)
        ? obj.itemIds.map(String)
        : [];
      const filteredIds = rawIds.filter((id) => validIds.has(id));

      return {
        id: `outfit-${idCounter++}`,
        name: String(obj.name || `Look ${idCounter - 1}`),
        itemIds:
          filteredIds.length > 0
            ? filteredIds
            : items.slice(0, 2).map((i) => i.id),
        description: String(
          obj.description || `A great combination for ${occasion}.`,
        ),
        vibeRating: Math.min(
          5,
          Math.max(1, Math.round(Number(obj.vibeRating) || 4)),
        ),
        occasion,
      };
    });

    return Response.json(outfits, { headers: corsHeaders(req) });
  } catch (err) {
    console.error("Outfits error:", err);
    // Try to extract items from the request for fallback
    try {
      const body = (await req.clone().json()) as {
        items?: ItemForPrompt[];
        occasion?: string;
      };
      return Response.json(
        fallbackOutfits(body.items ?? [], body.occasion ?? "casual"),
        { headers: corsHeaders(req) },
      );
    } catch {
      return Response.json([], { headers: corsHeaders(req) });
    }
  }
}

// ── Router ──────────────────────────────────────────────────

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // ── Rate limiting (applies to all requests) ──
  const ip = getClientIp(req);
  if (!rateLimitCheck(ip)) {
    return Response.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429, headers: corsHeaders(req) },
    );
  }

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  if (req.method === "POST" && url.pathname === "/api/analyze") {
    return handleAnalyze(req);
  }

  if (req.method === "POST" && url.pathname === "/api/outfits") {
    return handleOutfits(req);
  }

  return Response.json(
    { error: "Not found" },
    { status: 404, headers: corsHeaders(req) },
  );
}

// ── Start server ────────────────────────────────────────────

console.log(`API server starting on http://localhost:${PORT}`);
Bun.serve({
  port: PORT,
  maxRequestBodySize: 10 * 1024 * 1024, // 10MB body size limit
  fetch: handleRequest,
});
console.log(`API server listening on http://localhost:${PORT}`);
