import type { ClosetItem } from "../contexts/ClosetContext";
import type { ClothingAnalysis } from "./api";

export interface OutfitSuggestion {
  id: string;
  name: string;
  itemIds: string[];
  description: string;
  vibeRating: number;
  occasion: string;
}

interface ItemForPrompt {
  id: string;
  category: string;
  subcategory: string;
  color: string;
  pattern: string;
  styleTags: string[];
  seasonality: string[];
}

function toItemForPrompt(item: ClosetItem): ItemForPrompt {
  const a: ClothingAnalysis = item.analysis ?? {
    category: "top",
    subcategory: "unknown",
    color: "unknown",
    pattern: "solid",
    styleTags: ["casual"],
    seasonality: ["all"],
  };
  return {
    id: item.id,
    category: a.category,
    subcategory: a.subcategory,
    color: a.color,
    pattern: a.pattern,
    styleTags: a.styleTags,
    seasonality: a.seasonality,
  };
}

/**
 * Generate outfit suggestions by calling the backend proxy,
 * which forwards to OpenAI GPT-4o.
 * On failure, returns a fallback using simple combinatorial logic.
 */
export async function generateOutfits(
  items: ClosetItem[],
  occasion: string,
): Promise<OutfitSuggestion[]> {
  try {
    const promptItems = items.map(toItemForPrompt);
    const response = await fetch("/api/outfits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: promptItems, occasion }),
    });

    if (!response.ok) {
      console.error(`Server error (${response.status}) — using fallback generation`);
      return generateFallback(items, occasion);
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      console.error("Server returned non-array — using fallback generation");
      return generateFallback(items, occasion);
    }

    const validIds = new Set(items.map((item) => item.id));

    let idCounter = 1;
    return (data as Array<Record<string, unknown>>).slice(0, 5).map((o) => {
      const rawIds: string[] = Array.isArray(o.itemIds) ? o.itemIds.map(String) : [];
      const filteredIds = rawIds.filter((id) => validIds.has(id));

      return {
        id: String(o.id || `outfit-${idCounter++}`),
        name: String(o.name || `Look ${idCounter - 1}`),
        itemIds: filteredIds.length > 0 ? filteredIds : items.slice(0, 2).map((i) => i.id),
        description: String(o.description || `A great combination for ${occasion}.`),
        vibeRating: Math.min(5, Math.max(1, Math.round(Number(o.vibeRating) || 4))),
        occasion: String(o.occasion || occasion),
      };
    });
  } catch (err) {
    console.error("Failed to generate outfits:", err);
    return generateFallback(items, occasion);
  }
}

/** Smart fallback that builds outfits combinatorially from available items. */
function generateFallback(
  items: ClosetItem[],
  occasion: string,
): OutfitSuggestion[] {
  if (items.length === 0) return [];

  const tops = items.filter(
    (i) =>
      i.analysis?.category === "top" ||
      i.analysis?.category === "outerwear" ||
      i.analysis?.category === "dress",
  );
  const bottoms = items.filter((i) => i.analysis?.category === "bottom");
  const shoes = items.filter((i) => i.analysis?.category === "shoes");
  const accessories = items.filter(
    (i) => i.analysis?.category === "accessory",
  );

  const occasionMoods: Record<string, string[]> = {
    "date night": ["romantic", "sleek", "confident"],
    "job interview": ["polished", "professional", "sharp"],
    brunch: ["effortless", "fresh", "chic"],
    "casual friday": ["relaxed", "cool", "easygoing"],
    "night out": ["bold", "daring", "head-turning"],
    "wedding guest": ["elegant", "refined", "celebratory"],
  };

  const moods =
    occasionMoods[occasion.toLowerCase()] ?? ["stylish", "put-together", "fun"];

  const combos: OutfitSuggestion[] = [];
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

  const usedIds = new Set<string>();

  for (let i = 0; i < Math.min(5, items.length); i++) {
    const outfitIds: string[] = [];

    // Pick a top/dress
    const top = tops.find((t) => !usedIds.has(t.id)) ?? tops[0];
    if (top && !usedIds.has(top.id)) {
      outfitIds.push(top.id);
      usedIds.add(top.id);
    }

    // Pick a bottom (unless it's a dress)
    if (!items.find((it) => it.id === outfitIds[0] && it.analysis?.category === "dress")) {
      const bottom = bottoms.find((b) => !usedIds.has(b.id)) ?? bottoms[0];
      if (bottom && !usedIds.has(bottom.id)) {
        outfitIds.push(bottom.id);
        usedIds.add(bottom.id);
      }
    }

    // Pick shoes
    const shoe = shoes.find((s) => !usedIds.has(s.id)) ?? shoes[0];
    if (shoe && !usedIds.has(shoe.id)) {
      outfitIds.push(shoe.id);
      usedIds.add(shoe.id);
    }

    // Maybe an accessory
    if (Math.random() > 0.4) {
      const acc = accessories.find((a) => !usedIds.has(a.id));
      if (acc) {
        outfitIds.push(acc.id);
        usedIds.add(acc.id);
      }
    }

    // Fallback: if we somehow ended up with nothing, grab any unused item
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
        occasion,
      });
    }

    // Reset usedIds if we're running out of unique items
    if (usedIds.size >= items.length * 0.8) {
      usedIds.clear();
    }
  }

  return combos;
}
