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

/**
 * Analyze a clothing item image by calling the backend proxy,
 * which forwards to OpenAI GPT-4o vision.
 * Handles errors gracefully — returns fallback defaults on failure.
 */
export async function analyzeClothingItem(
  imageDataUrl: string,
): Promise<ClothingAnalysis> {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl }),
    });

    if (!response.ok) {
      console.error(`Server error (${response.status}) — returning fallback analysis`);
      return { ...FALLBACK_ANALYSIS };
    }

    const data = await response.json();

    // Validate the response shape
    return {
      category: String(data.category || FALLBACK_ANALYSIS.category),
      subcategory: String(data.subcategory || FALLBACK_ANALYSIS.subcategory),
      color: String(data.color || FALLBACK_ANALYSIS.color),
      pattern: String(data.pattern || FALLBACK_ANALYSIS.pattern),
      styleTags: Array.isArray(data.styleTags) ? data.styleTags : FALLBACK_ANALYSIS.styleTags,
      seasonality: Array.isArray(data.seasonality) ? data.seasonality : FALLBACK_ANALYSIS.seasonality,
    };
  } catch (err) {
    console.error("Failed to analyze clothing item:", err);
    return { ...FALLBACK_ANALYSIS };
  }
}
