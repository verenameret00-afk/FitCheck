import type { OutfitSuggestion } from "./outfits";
import type { ClosetItem } from "../contexts/ClosetContext";
import type { StylePersona } from "./styleProfile";

/* ── Shared types ── */

export interface CommunityMember {
  id: string;
  name: string;
  avatarEmoji: string;
  persona: StylePersona;
}

export interface CommunityComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
}

export interface CommunityPost {
  id: string;
  author: CommunityMember;
  outfit: OutfitSuggestion;
  items: ClosetItem[];
  likes: number;
  comments: CommunityComment[];
  timestamp: string;
}

export interface TwinMatch {
  id: string;
  name: string;
  avatarEmoji: string;
  persona: StylePersona;
  matchPercentage: number;
  sharedItems: number;
  topColor: string;
}

/* ── Demo Members ── */

export const COMMUNITY_MEMBERS: CommunityMember[] = [
  {
    id: "maya",
    name: "Maya",
    avatarEmoji: "👩🏽‍🦱",
    persona: {
      label: "Streetwear Queen",
      emoji: "👑",
      description: "Bold, edgy, and always ahead of the curve",
    },
  },
  {
    id: "sophie",
    name: "Sophie",
    avatarEmoji: "👩🏻",
    persona: {
      label: "Casual Minimalist",
      emoji: "🤍",
      description: "Clean lines, neutral tones, effortless style",
    },
  },
  {
    id: "zara",
    name: "Zara",
    avatarEmoji: "👩🏾",
    persona: {
      label: "Boho Dreamer",
      emoji: "🌿",
      description: "Free-spirited, romantic, and whimsical",
    },
  },
  {
    id: "juno",
    name: "Juno",
    avatarEmoji: "👩🏻‍🎨",
    persona: {
      label: "Eclectic Creative",
      emoji: "🎨",
      description: "Mixing patterns, colors, and eras fearlessly",
    },
  },
  {
    id: "poppy",
    name: "Poppy",
    avatarEmoji: "👩‍🦰",
    persona: {
      label: "Cozy Core",
      emoji: "🧸",
      description: "Comfort-first with a stylish twist",
    },
  },
];

/* ── Demo Twin Matches (mirrors StyleTwin DEMO_MATCHES) ── */

export const DEMO_TWIN_MATCHES: TwinMatch[] = [
  {
    id: "twin-1",
    name: "Maya",
    avatarEmoji: "👩🏽‍🦱",
    persona: {
      label: "Streetwear Queen",
      emoji: "👑",
      description: "Bold, edgy, and always ahead of the curve",
    },
    matchPercentage: 87,
    sharedItems: 12,
    topColor: "#ef4444",
  },
  {
    id: "twin-2",
    name: "Sophie",
    avatarEmoji: "👩🏻",
    persona: {
      label: "Casual Minimalist",
      emoji: "🤍",
      description: "Clean lines, neutral tones, effortless style",
    },
    matchPercentage: 74,
    sharedItems: 8,
    topColor: "#d4c5a9",
  },
  {
    id: "twin-3",
    name: "Zara",
    avatarEmoji: "👩🏾",
    persona: {
      label: "Boho Dreamer",
      emoji: "🌿",
      description: "Free-spirited, romantic, and whimsical",
    },
    matchPercentage: 68,
    sharedItems: 6,
    topColor: "#5c6b3c",
  },
];

/* ── Placeholder data URLs for demo clothing items ── */

function solidSvg(color: string): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="${color}"/><text x="100" y="110" text-anchor="middle" font-size="40" fill="rgba(255,255,255,0.5)">👗</text></svg>`)}`;
}

function stripeSvg(c1: string, c2: string): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="${c1}"/><rect y="0" width="40" height="200" fill="${c2}" opacity="0.6"/><rect y="0" x="80" width="40" height="200" fill="${c2}" opacity="0.6"/><rect y="0" x="160" width="40" height="200" fill="${c2}" opacity="0.6"/></svg>`)}`;
}

/* ── Demo Closet Items (used by posts to render LookbookCard) ── */

function makeItem(id: string, name: string, dataUrl: string, category: string, color: string, tags: string[]): ClosetItem {
  return {
    id,
    name,
    dataUrl,
    analysis: {
      category,
      subcategory: category,
      color,
      pattern: "solid",
      styleTags: tags,
      seasonality: ["all"],
    },
    isAnalyzing: false,
  };
}

const DEMO_ITEMS: Record<string, ClosetItem> = {
  "d-top-cream": makeItem("d-top-cream", "Cream Silk Blouse", solidSvg("#f5f0e8"), "top", "cream", ["minimal", "casual"]),
  "d-bot-taupe": makeItem("d-bot-taupe", "Taupe Wide Trousers", solidSvg("#b8a99a"), "bottom", "beige", ["minimal", "casual"]),
  "d-shoe-nude": makeItem("d-shoe-nude", "Nude Block Heels", solidSvg("#d4b896"), "shoes", "tan", ["minimal", "formal"]),
  "d-acc-gold": makeItem("d-acc-gold", "Gold Chain Necklace", solidSvg("#e8d5a3"), "accessory", "gold", ["minimal"]),

  "d-top-red": makeItem("d-top-red", "Red Oversized Hoodie", solidSvg("#c0392b"), "top", "red", ["streetwear", "edgy"]),
  "d-bot-black": makeItem("d-bot-black", "Black Cargo Pants", solidSvg("#2c2c2c"), "bottom", "black", ["streetwear", "edgy"]),
  "d-shoe-chunky": makeItem("d-shoe-chunky", "Chunky White Sneakers", solidSvg("#f0f0f0"), "shoes", "white", ["streetwear", "casual"]),

  "d-dress-floral": makeItem("d-dress-floral", "Floral Maxi Dress", stripeSvg("#e8d5c4", "#c4a882"), "dress", "beige", ["boho", "romantic"]),
  "d-shoe-sandal": makeItem("d-shoe-sandal", "Leather Sandals", solidSvg("#8b6914"), "shoes", "brown", ["boho", "casual"]),
  "d-acc-beads": makeItem("d-acc-beads", "Wooden Bead Bracelet", solidSvg("#6b4c3b"), "accessory", "brown", ["boho", "romantic"]),

  "d-top-teal": makeItem("d-top-teal", "Teal Silk Cami", solidSvg("#2e8b8b"), "top", "teal", ["eclectic", "formal"]),
  "d-bot-plaid": makeItem("d-bot-plaid", "Plaid Wide-Leg Pants", stripeSvg("#3a3a5c", "#7a7a9c"), "bottom", "navy", ["eclectic", "vintage"]),
  "d-shoe-oxford": makeItem("d-shoe-oxford", "Patent Oxfords", solidSvg("#1a1a1a"), "shoes", "black", ["eclectic", "formal"]),

  "d-top-knit": makeItem("d-top-knit", "Chunky Knit Sweater", solidSvg("#d4c5a9"), "top", "beige", ["casual", "cozy"]),
  "d-bot-jean": makeItem("d-bot-jean", "Vintage Wash Jeans", solidSvg("#5b7a9e"), "bottom", "blue", ["casual", "cozy"]),
  "d-shoe-ugg": makeItem("d-shoe-ugg", "Shearling Boots", solidSvg("#8b7355"), "shoes", "brown", ["casual", "cozy"]),
  "d-acc-scarf": makeItem("d-acc-scarf", "Oversized Wool Scarf", solidSvg("#a89f91"), "accessory", "gray", ["casual", "cozy"]),

  "d-top-pink": makeItem("d-top-pink", "Blush Ruffle Blouse", solidSvg("#e8b4b8"), "top", "pink", ["romantic", "formal"]),
  "d-bot-white": makeItem("d-bot-white", "White Tailored Shorts", solidSvg("#f5f5f5"), "bottom", "white", ["casual", "formal"]),
  "d-shoe-strap": makeItem("d-shoe-strap", "Ankle Strap Heels", solidSvg("#d4af37"), "shoes", "gold", ["romantic", "formal"]),
};

/* ── Helper to collect items from IDs ── */
function getItems(ids: string[]): ClosetItem[] {
  return ids.map((id) => DEMO_ITEMS[id]).filter(Boolean);
}

/* ── Demo Posts ── */

export const DEMO_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    author: COMMUNITY_MEMBERS[0], // Maya
    outfit: {
      id: "outfit-maya-1",
      name: "After Hours Edge",
      itemIds: ["d-top-red", "d-bot-black", "d-shoe-chunky"],
      description: "When the streetlights hit and you need a fit that means business. The oversized hoodie + cargos combo is undefeated.",
      vibeRating: 5,
      occasion: "night out",
    },
    items: getItems(["d-top-red", "d-bot-black", "d-shoe-chunky"]),
    likes: 143,
    comments: [
      { id: "c1", authorName: "Poppy", authorAvatar: "👩‍🦰", text: "This goes SO hard 🔥🔥", timestamp: "2h ago" },
      { id: "c2", authorName: "Juno", authorAvatar: "👩🏻‍🎨", text: "Where did you get those cargos??", timestamp: "1h ago" },
    ],
    timestamp: "3h ago",
  },
  {
    id: "post-2",
    author: COMMUNITY_MEMBERS[1], // Sophie
    outfit: {
      id: "outfit-sophie-1",
      name: "Quiet Luxury",
      itemIds: ["d-top-cream", "d-bot-taupe", "d-shoe-nude", "d-acc-gold"],
      description: "Proof that less really is more. Neutrals done right for a gallery opening — felt like a walking sculpture.",
      vibeRating: 4,
      occasion: "brunch",
    },
    items: getItems(["d-top-cream", "d-bot-taupe", "d-shoe-nude", "d-acc-gold"]),
    likes: 98,
    comments: [
      { id: "c3", authorName: "Zara", authorAvatar: "👩🏾", text: "So elegant! That blouse is everything.", timestamp: "5h ago" },
      { id: "c4", authorName: "Maya", authorAvatar: "👩🏽‍🦱", text: "Clean 👌", timestamp: "4h ago" },
      { id: "c5", authorName: "Sophie", authorAvatar: "👩🏻", text: "Thank you!! It's actually thrifted 😊", timestamp: "3h ago" },
    ],
    timestamp: "6h ago",
  },
  {
    id: "post-3",
    author: COMMUNITY_MEMBERS[2], // Zara
    outfit: {
      id: "outfit-zara-1",
      name: "Sunday Bloom",
      itemIds: ["d-dress-floral", "d-shoe-sandal", "d-acc-beads"],
      description: "Farmer's market mornings call for something that flows. This maxi dress makes me feel like I'm floating through a meadow.",
      vibeRating: 5,
      occasion: "brunch",
    },
    items: getItems(["d-dress-floral", "d-shoe-sandal", "d-acc-beads"]),
    likes: 211,
    comments: [
      { id: "c6", authorName: "Poppy", authorAvatar: "👩‍🦰", text: "You're literally a sunflower 🌻", timestamp: "8h ago" },
      { id: "c7", authorName: "Juno", authorAvatar: "👩🏻‍🎨", text: "manifesting this energy for my Sunday", timestamp: "7h ago" },
    ],
    timestamp: "9h ago",
  },
  {
    id: "post-4",
    author: COMMUNITY_MEMBERS[3], // Juno
    outfit: {
      id: "outfit-juno-1",
      name: "Pattern Play",
      itemIds: ["d-top-teal", "d-bot-plaid", "d-shoe-oxford"],
      description: "Everyone said plaid + teal wouldn't work. They were wrong. This is what happens when you trust your instincts.",
      vibeRating: 4,
      occasion: "casual friday",
    },
    items: getItems(["d-top-teal", "d-bot-plaid", "d-shoe-oxford"]),
    likes: 87,
    comments: [
      { id: "c8", authorName: "Maya", authorAvatar: "👩🏽‍🦱", text: "The CONFIDENCE ✨", timestamp: "12h ago" },
    ],
    timestamp: "14h ago",
  },
  {
    id: "post-5",
    author: COMMUNITY_MEMBERS[4], // Poppy
    outfit: {
      id: "outfit-poppy-1",
      name: "Cozy Szn",
      itemIds: ["d-top-knit", "d-bot-jean", "d-shoe-ugg", "d-acc-scarf"],
      description: "Rainy day, hot coffee, and the softest knit in my closet. Sometimes the best outfits are the ones that feel like a hug.",
      vibeRating: 5,
      occasion: "casual friday",
    },
    items: getItems(["d-top-knit", "d-bot-jean", "d-shoe-ugg", "d-acc-scarf"]),
    likes: 176,
    comments: [
      { id: "c9", authorName: "Sophie", authorAvatar: "👩🏻", text: "Cozy girl autumn is undefeated 🍂", timestamp: "16h ago" },
      { id: "c10", authorName: "Zara", authorAvatar: "👩🏾", text: "Need that sweater immediately", timestamp: "15h ago" },
      { id: "c11", authorName: "Poppy", authorAvatar: "👩‍🦰", text: "It's from &Other Stories last season!", timestamp: "14h ago" },
    ],
    timestamp: "18h ago",
  },
  {
    id: "post-6",
    author: COMMUNITY_MEMBERS[0], // Maya again
    outfit: {
      id: "outfit-maya-2",
      name: "Interview Ready",
      itemIds: ["d-top-pink", "d-bot-white", "d-shoe-strap"],
      description: "Who says professional has to be boring? Landed the job and looked cute doing it. Power dressing, but make it blush.",
      vibeRating: 4,
      occasion: "job interview",
    },
    items: getItems(["d-top-pink", "d-bot-white", "d-shoe-strap"]),
    likes: 234,
    comments: [
      { id: "c12", authorName: "Juno", authorAvatar: "👩🏻‍🎨", text: "Congrats on the job!! 🎉🎉", timestamp: "20h ago" },
      { id: "c13", authorName: "Sophie", authorAvatar: "👩🏻", text: "Obsessed with the blush + gold combo", timestamp: "19h ago" },
    ],
    timestamp: "22h ago",
  },
  {
    id: "post-7",
    author: COMMUNITY_MEMBERS[2], // Zara again
    outfit: {
      id: "outfit-zara-2",
      name: "Golden Hour Glow",
      itemIds: ["d-dress-floral", "d-shoe-strap", "d-acc-gold"],
      description: "Date night at that rooftop bar downtown. The sunset matched the gold details perfectly — one of those magical evenings.",
      vibeRating: 5,
      occasion: "date night",
    },
    items: getItems(["d-dress-floral", "d-shoe-strap", "d-acc-gold"]),
    likes: 312,
    comments: [
      { id: "c14", authorName: "Maya", authorAvatar: "👩🏽‍🦱", text: "Main character energy ⭐", timestamp: "1d ago" },
      { id: "c15", authorName: "Poppy", authorAvatar: "👩‍🦰", text: "This is THE date night look", timestamp: "1d ago" },
      { id: "c16", authorName: "Juno", authorAvatar: "👩🏻‍🎨", text: "rooftop + florals = perfect combo", timestamp: "23h ago" },
    ],
    timestamp: "1d ago",
  },
  {
    id: "post-8",
    author: COMMUNITY_MEMBERS[3], // Juno again
    outfit: {
      id: "outfit-juno-2",
      name: "Art Opening Fit",
      itemIds: ["d-top-teal", "d-bot-taupe", "d-shoe-chunky", "d-acc-gold"],
      description: "Gallery openings demand a look that says 'I might be the artist.' Mixed textures, unexpected pairings, and a lot of attitude.",
      vibeRating: 5,
      occasion: "night out",
    },
    items: getItems(["d-top-teal", "d-bot-taupe", "d-shoe-chunky", "d-acc-gold"]),
    likes: 167,
    comments: [
      { id: "c17", authorName: "Sophie", authorAvatar: "👩🏻", text: "The teal + chunky sneakers is genius", timestamp: "1d ago" },
    ],
    timestamp: "2d ago",
  },
];
