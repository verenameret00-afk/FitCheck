export interface ClothingAnalysis {
  category: string;
  subcategory: string;
  color: string;
  pattern: string;
  styleTags: string[];
  seasonality: string[];
}

const FALLBACK_ANALYSIS: ClothingAnalysis = {
  category: "top",
  subcategory: "unknown",
  color: "unknown",
  pattern: "solid",
  styleTags: ["casual"],
  seasonality: ["all"],
};

const ANALYSIS_PROMPT = `Analyze this clothing item in detail. Return ONLY a JSON object (no markdown, no code fences, no extra text) with these fields:
- "category": one of "top", "bottom", "dress", "outerwear", "shoes", "accessory"
- "subcategory": specific type (e.g. "t-shirt", "jeans", "blazer", "sneakers", "necklace")
- "color": primary color name
- "pattern": one of "solid", "striped", "floral", "plaid", "polka dot", "color block", "graphic", "animal print", "other"
- "styleTags": array of 2-4 style tags like "casual", "formal", "vintage", "streetwear", "preppy", "boho", "minimal", "edgy", "romantic", "athleisure"
- "seasonality": array of applicable seasons from ["spring", "summer", "fall", "winter"]

Example response:
{"category":"top","subcategory":"t-shirt","color":"navy","pattern":"solid","styleTags":["casual","minimal"],"seasonality":["spring","summer","fall"]}`;

/**
 * Analyze a clothing item image using OpenAI GPT-4o vision.
 * Handles errors gracefully — returns fallback defaults on failure.
 */
export async function analyzeClothingItem(
  imageDataUrl: string,
): Promise<ClothingAnalysis> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === "placeholder_replace_me") {
    console.warn(
      "OpenAI API key not configured — returning fallback analysis",
    );
    return { ...FALLBACK_ANALYSIS };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `OpenAI API error (${response.status}): ${errorText.slice(0, 200)}`,
      );
      return { ...FALLBACK_ANALYSIS };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("OpenAI API returned empty content");
      return { ...FALLBACK_ANALYSIS };
    }

    // Parse the JSON — strip any potential code fences
    const jsonStr = content
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(jsonStr);

    // Validate and coerce the response
    return {
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
    };
  } catch (err) {
    console.error("Failed to analyze clothing item:", err);
    return { ...FALLBACK_ANALYSIS };
  }
}

const VALID_CATEGORIES = [
  "top",
  "bottom",
  "dress",
  "outerwear",
  "shoes",
  "accessory",
];

function validCategory(c: unknown): string {
  const s = String(c || "top").toLowerCase();
  return VALID_CATEGORIES.includes(s) ? s : "top";
}
