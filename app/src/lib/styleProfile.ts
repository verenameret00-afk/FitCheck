import type { ClosetItem } from "../contexts/ClosetContext";

export interface StylePersona {
  label: string;
  emoji: string;
  description: string;
}

export interface DominantColor {
  color: string;
  hex: string;
  percentage: number;
}

export interface StyleVibe {
  vibe: string;
  percentage: number;
}

export interface CategoryBreakdown {
  category: string;
  emoji: string;
  count: number;
}

export interface StyleProfile {
  dominantColors: DominantColor[];
  styleVibes: StyleVibe[];
  categoryBreakdown: CategoryBreakdown[];
  wardrobeSize: number;
  persona: StylePersona;
}

const COLOR_HEX_MAP: Record<string, string> = {
  black: "#1a1a1a",
  white: "#f5f5f5",
  navy: "#1b2a4a",
  blue: "#3b82f6",
  red: "#ef4444",
  pink: "#ec4899",
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  purple: "#a855f7",
  brown: "#92400e",
  gray: "#6b7280",
  grey: "#6b7280",
  beige: "#d4c5a9",
  tan: "#d2b48c",
  cream: "#fdf6e3",
  burgundy: "#800020",
  maroon: "#800000",
  olive: "#808000",
  teal: "#008080",
  coral: "#ff6f61",
  gold: "#ffd700",
  silver: "#c0c0c0",
};

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  top: "👕",
  bottom: "👖",
  dress: "👗",
  outerwear: "🧥",
  shoes: "👟",
  accessory: "💍",
};

function getColorHex(colorName: string): string {
  return COLOR_HEX_MAP[colorName.toLowerCase()] || "#888";
}

interface PersonaRule {
  label: string;
  emoji: string;
  description: string;
  match: (tags: string[], categories: Record<string, number>, size: number) => boolean;
}

const PERSONA_RULES: PersonaRule[] = [
  {
    label: "Casual Minimalist",
    emoji: "🤍",
    description: "Clean lines, neutral tones, effortless style",
    match: (tags, _cats, _size) =>
      (tags.includes("casual") || tags.includes("minimal")) && tags.includes("minimal"),
  },
  {
    label: "Streetwear Queen",
    emoji: "👑",
    description: "Bold, edgy, and always ahead of the curve",
    match: (tags, _cats, _size) =>
      tags.includes("streetwear") || tags.includes("edgy"),
  },
  {
    label: "Corporate Chic",
    emoji: "💼",
    description: "Polished, professional, and powerfully stylish",
    match: (tags, _cats, _size) =>
      (tags.includes("formal") || tags.includes("preppy")) && !tags.includes("streetwear"),
  },
  {
    label: "Boho Dreamer",
    emoji: "🌿",
    description: "Free-spirited, romantic, and whimsical",
    match: (tags, _cats, _size) =>
      tags.includes("boho") || tags.includes("romantic"),
  },
  {
    label: "Cozy Core",
    emoji: "🧸",
    description: "Comfort-first with a stylish twist",
    match: (tags, _cats, _size) =>
      tags.includes("athleisure") || (tags.includes("casual") && !tags.includes("formal")),
  },
  {
    label: "Vintage Soul",
    emoji: "📻",
    description: "Timeless pieces with retro charm",
    match: (tags, _cats, _size) =>
      tags.includes("vintage"),
  },
  {
    label: "Eclectic Creative",
    emoji: "🎨",
    description: "Mixing patterns, colors, and eras fearlessly",
    match: (tags, _cats, size) =>
      tags.length >= 3 || size <= 5,
  },
  {
    label: "Glam Icon",
    emoji: "✨",
    description: "All about the drama and the details",
    match: (_tags, cats, _size) =>
      (cats["dress"] || 0) >= 3 || (cats["accessory"] || 0) >= 4,
  },
];

function determinePersona(
  tagFreq: Map<string, number>,
  categoryCounts: Record<string, number>,
  size: number,
): StylePersona {
  const tags = Array.from(tagFreq.keys());

  // Try rules in order
  for (const rule of PERSONA_RULES) {
    if (rule.match(tags, categoryCounts, size)) {
      return {
        label: rule.label,
        emoji: rule.emoji,
        description: rule.description,
      };
    }
  }

  // Default fallback
  return {
    label: "Style Explorer",
    emoji: "🔍",
    description: "Still discovering your signature look",
  };
}

function isValidAnalysis(item: ClosetItem): item is ClosetItem & { analysis: NonNullable<ClosetItem["analysis"]> } {
  return item.analysis !== null && !item.isAnalyzing;
}

/**
 * Generate a Style Profile by analyzing the user's closet items.
 * Works entirely client-side — no API needed.
 */
export function generateStyleProfile(items: ClosetItem[]): StyleProfile | null {
  const analyzed = items.filter(isValidAnalysis);

  if (analyzed.length === 0) return null;

  const wardrobeSize = items.length;

  // --- Dominant Colors ---
  const colorCount = new Map<string, number>();
  for (const item of analyzed) {
    const c = item.analysis.color.toLowerCase();
    if (c === "unknown") continue;
    colorCount.set(c, (colorCount.get(c) || 0) + 1);
  }
  const sortedColors = Array.from(colorCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const totalColorItems = sortedColors.reduce((sum, [, n]) => sum + n, 0) || 1;
  const dominantColors: DominantColor[] = sortedColors.map(([color, count]) => ({
    color: color.charAt(0).toUpperCase() + color.slice(1),
    hex: getColorHex(color),
    percentage: Math.round((count / totalColorItems) * 100),
  }));

  // --- Style Vibes ---
  const tagFreq = new Map<string, number>();
  for (const item of analyzed) {
    for (const tag of item.analysis.styleTags) {
      const t = tag.toLowerCase();
      tagFreq.set(t, (tagFreq.get(t) || 0) + 1);
    }
  }
  const totalTags = Array.from(tagFreq.values()).reduce((a, b) => a + b, 0) || 1;
  const sortedVibes = Array.from(tagFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const styleVibes: StyleVibe[] = sortedVibes.map(([vibe, count]) => ({
    vibe: vibe.charAt(0).toUpperCase() + vibe.slice(1),
    percentage: Math.round((count / totalTags) * 100),
  }));

  // --- Category Breakdown ---
  const catCount: Record<string, number> = {};
  for (const item of analyzed) {
    const cat = item.analysis.category;
    catCount[cat] = (catCount[cat] || 0) + 1;
  }
  const categoryBreakdown: CategoryBreakdown[] = [
    "top",
    "bottom",
    "dress",
    "outerwear",
    "shoes",
    "accessory",
  ]
    .filter((cat) => (catCount[cat] || 0) > 0)
    .map((cat) => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      emoji: CATEGORY_EMOJI_MAP[cat] || "👔",
      count: catCount[cat] || 0,
    }));

  // --- Persona ---
  const persona = determinePersona(tagFreq, catCount, wardrobeSize);

  return {
    dominantColors,
    styleVibes,
    categoryBreakdown,
    wardrobeSize,
    persona,
  };
}
