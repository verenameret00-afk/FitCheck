const OPENAI_API_KEY = Bun.env.OPENAI_API_KEY;
const STRIPE_SECRET_KEY = Bun.env.STRIPE_SECRET_KEY;

const PORT = 3001;

const STRIPE_PRICE_ID = "price_1Tw0aoDRIgJ12NLHgzxmf60A";
const SUCCESS_URL_BASE = "https://fitcheck.ctonew.app/success";
const CANCEL_URL = "https://fitcheck.ctonew.app/profile";

function hasStripeKey(): boolean {
  return Boolean(STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.startsWith("sk_placeholder"));
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
  return VALID_CATEGORIES.includes(s as typeof VALID_CATEGORIES[number]) ? s : "top";
}

// ── CORS headers ────────────────────────────────────────────

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
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
      return Response.json({ error: "imageDataUrl required" }, { status: 400, headers: corsHeaders() });
    }

    if (!OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not set — returning fallback analysis");
      return Response.json(fallbackAnalysis(), { headers: corsHeaders() });
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
      console.error(`OpenAI API error (${openaiResp.status}): ${errorText.slice(0, 200)}`);
      return Response.json(fallbackAnalysis(), { headers: corsHeaders() });
    }

    const data = (await openaiResp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("OpenAI API returned empty content");
      return Response.json(fallbackAnalysis(), { headers: corsHeaders() });
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
      { headers: corsHeaders() },
    );
  } catch (err) {
    console.error("Analyze error:", err);
    return Response.json(fallbackAnalysis(), { headers: corsHeaders() });
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
    (i) => i.category === "top" || i.category === "outerwear" || i.category === "dress",
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

  const moods = occasionMoods[occasion.toLowerCase()] ?? ["stylish", "put-together", "fun"];

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
      const bottom = bottoms.find((b) => !usedIds.has(b.id)) ?? bottoms[0];
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
        description: `${moods[i % moods.length].charAt(0).toUpperCase() + moods[i % moods.length].slice(1)} — ${descriptions[i % descriptions.length]}`,
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

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json(fallbackOutfits(items, occasion), { headers: corsHeaders() });
    }

    if (!OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not set — using fallback outfit generation");
      return Response.json(fallbackOutfits(items, occasion), { headers: corsHeaders() });
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
            content: buildPrompt(items, occasion),
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!openaiResp.ok) {
      const errorText = await openaiResp.text();
      console.error(`OpenAI API error (${openaiResp.status}): ${errorText.slice(0, 200)}`);
      return Response.json(fallbackOutfits(items, occasion), { headers: corsHeaders() });
    }

    const data = (await openaiResp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("OpenAI API returned empty content");
      return Response.json(fallbackOutfits(items, occasion), { headers: corsHeaders() });
    }

    const parsed = parseJsonFromContent(content);

    if (!Array.isArray(parsed)) {
      throw new Error("Expected an array of outfits");
    }

    const validIds = new Set(items.map((item) => item.id));
    let idCounter = 1;

    const outfits = parsed.slice(0, 5).map((o: unknown) => {
      const obj = o as Record<string, unknown>;
      const rawIds: string[] = Array.isArray(obj.itemIds) ? obj.itemIds.map(String) : [];
      const filteredIds = rawIds.filter((id) => validIds.has(id));

      return {
        id: `outfit-${idCounter++}`,
        name: String(obj.name || `Look ${idCounter - 1}`),
        itemIds: filteredIds.length > 0 ? filteredIds : items.slice(0, 2).map((i) => i.id),
        description: String(obj.description || `A great combination for ${occasion}.`),
        vibeRating: Math.min(5, Math.max(1, Math.round(Number(obj.vibeRating) || 4))),
        occasion,
      };
    });

    return Response.json(outfits, { headers: corsHeaders() });
  } catch (err) {
    console.error("Outfits error:", err);
    // Try to extract items from the request for fallback
    try {
      const body = (await req.clone().json()) as { items?: ItemForPrompt[]; occasion?: string };
      return Response.json(fallbackOutfits(body.items ?? [], body.occasion ?? "casual"), {
        headers: corsHeaders(),
      });
    } catch {
      return Response.json([], { headers: corsHeaders() });
    }
  }
}

// ── /api/create-checkout ────────────────────────────────────

async function handleCreateCheckout(req: Request): Promise<Response> {
  try {
    if (!hasStripeKey()) {
      console.warn("STRIPE_SECRET_KEY not configured — returning fallback");
      return Response.json(
        { error: "stripe_not_configured", fallback: true },
        { status: 503, headers: corsHeaders() },
      );
    }

    const stripeResp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "line_items[0][price]": STRIPE_PRICE_ID,
        "line_items[0][quantity]": "1",
        "mode": "payment",
        "success_url": `${SUCCESS_URL_BASE}?session_id={CHECKOUT_SESSION_ID}`,
        "cancel_url": CANCEL_URL,
      }).toString(),
    });

    if (!stripeResp.ok) {
      const errorText = await stripeResp.text();
      console.error(`Stripe create session error (${stripeResp.status}): ${errorText.slice(0, 300)}`);
      return Response.json(
        { error: "stripe_error", message: "Could not create checkout session" },
        { status: 502, headers: corsHeaders() },
      );
    }

    const session = (await stripeResp.json()) as { url?: string; id?: string };
    return Response.json({ url: session.url, sessionId: session.id }, { headers: corsHeaders() });
  } catch (err) {
    console.error("Create checkout error:", err);
    return Response.json(
      { error: "server_error", message: "Internal server error" },
      { status: 500, headers: corsHeaders() },
    );
  }
}

// ── /api/verify-payment ─────────────────────────────────────

async function handleVerifyPayment(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
      return Response.json({ paid: false, error: "Missing session_id" }, { status: 400, headers: corsHeaders() });
    }

    if (!hasStripeKey()) {
      // When Stripe isn't configured, allow test unlock via a magic session ID
      if (sessionId === "test_unlock") {
        return Response.json({ paid: true, test: true }, { headers: corsHeaders() });
      }
      return Response.json({ paid: false, error: "stripe_not_configured" }, { headers: corsHeaders() });
    }

    const stripeResp = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        },
      },
    );

    if (!stripeResp.ok) {
      const errorText = await stripeResp.text();
      console.error(`Stripe verify error (${stripeResp.status}): ${errorText.slice(0, 200)}`);
      return Response.json({ paid: false, error: "Session lookup failed" }, { headers: corsHeaders() });
    }

    const session = (await stripeResp.json()) as {
      payment_status?: string;
      status?: string;
    };

    const isPaid =
      session.payment_status === "paid" && session.status === "complete";

    return Response.json({ paid: isPaid }, { headers: corsHeaders() });
  } catch (err) {
    console.error("Verify payment error:", err);
    return Response.json({ paid: false, error: "Internal server error" }, { status: 500, headers: corsHeaders() });
  }
}

// ── Router ──────────────────────────────────────────────────

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method === "POST" && url.pathname === "/api/analyze") {
    return handleAnalyze(req);
  }

  if (req.method === "POST" && url.pathname === "/api/outfits") {
    return handleOutfits(req);
  }

  if (req.method === "POST" && url.pathname === "/api/create-checkout") {
    return handleCreateCheckout(req);
  }

  if (req.method === "GET" && url.pathname === "/api/verify-payment") {
    return handleVerifyPayment(req);
  }

  return Response.json({ error: "Not found" }, { status: 404, headers: corsHeaders() });
}

// ── Start server ────────────────────────────────────────────

console.log(`API server starting on http://localhost:${PORT}`);
Bun.serve({
  port: PORT,
  fetch: handleRequest,
});
console.log(`API server listening on http://localhost:${PORT}`);
