const CATALOG_CATEGORIES = [
  {
    key: "indoor-plants",
    label: "Indoor Plants",
    section: "Indoor",
    description: "Popular plants for home and office spaces.",
    order: 10,
    aliases: ["indoor", "indoor plant", "home plants"],
  },
  {
    key: "low-light-plants",
    label: "Low Light Plants",
    section: "Indoor",
    description: "Plants that thrive in low sunlight corners.",
    order: 20,
    aliases: ["low light", "shade plants"],
  },
  {
    key: "low-maintenance-plants",
    label: "Low Maintenance Plants",
    section: "Indoor",
    description: "Beginner-friendly plants with minimal care.",
    order: 30,
    aliases: ["easy care", "easy plants"],
  },
  {
    key: "air-purifying-plants",
    label: "Air Purifying Plants",
    section: "Indoor",
    description: "Plants known to improve indoor air quality.",
    order: 40,
    aliases: ["air purifier", "air purifying"],
  },
  {
    key: "pet-friendly-plants",
    label: "Pet-Friendly Plants",
    section: "Indoor",
    description: "Safe and non-toxic plants for pet households.",
    order: 50,
    aliases: ["pet friendly"],
  },
  {
    key: "hanging-plants",
    label: "Hanging Plants",
    section: "Indoor",
    description: "Trailing and hanging varieties for decor.",
    order: 60,
    aliases: ["hanging"],
  },
  {
    key: "cacti-succulents",
    label: "Cacti and Succulents",
    section: "Indoor",
    description: "Drought-tolerant plants with striking forms.",
    order: 70,
    aliases: ["succulent", "cactus", "cacti"],
  },
  {
    key: "medicinal-aromatic-plants",
    label: "Medicinal & Aromatic Plants",
    section: "Indoor",
    description: "Useful herbs and aromatic varieties.",
    order: 80,
    aliases: ["medicinal", "aromatic plants"],
  },
  {
    key: "bonsai-plants",
    label: "Bonsai Plants",
    section: "Indoor",
    description: "Curated bonsai plants for premium decor.",
    order: 90,
    aliases: ["bonsai"],
  },
  {
    key: "rare-exotic-plants",
    label: "Rare & Exotic Plants",
    section: "Indoor",
    description: "Collector-grade exotic plant varieties.",
    order: 100,
    aliases: ["rare plants", "exotic"],
  },
  {
    key: "xl-plants",
    label: "XL Plants",
    section: "Indoor",
    description: "Large statement plants for bigger spaces.",
    order: 110,
    aliases: ["big plants", "large plants"],
  },
  {
    key: "outdoor-plants",
    label: "Outdoor Plants",
    section: "Outdoor",
    description: "Hardy plants for balconies and gardens.",
    order: 120,
    aliases: ["outdoor", "garden plants"],
  },
  {
    key: "flowering-plants",
    label: "Flowering Plants",
    section: "Outdoor",
    description: "Seasonal and perennial bloomers.",
    order: 130,
    aliases: ["flowers", "flower plants"],
  },
  {
    key: "fruit-plants",
    label: "Fruit Plants",
    section: "Outdoor",
    description: "Fruit-bearing plants for home gardens.",
    order: 140,
    aliases: ["fruit", "fruiting plants"],
  },
  {
    key: "herb-plants",
    label: "Herb Plants",
    section: "Outdoor",
    description: "Live culinary herbs for kitchen gardens.",
    order: 150,
    aliases: ["herbs", "kitchen herbs"],
  },
  {
    key: "edible-garden-plants",
    label: "Edible Garden Plants",
    section: "Outdoor",
    description: "Edible varieties for organic home growing.",
    order: 160,
    aliases: ["edible plants", "kitchen garden"],
  },
  {
    key: "flower-seeds",
    label: "Flower Seeds",
    section: "Seeds & Bulbs",
    description: "Seeds for flowering plants.",
    order: 170,
    aliases: ["flower seed", "seeds flowers"],
  },
  {
    key: "vegetable-seeds",
    label: "Vegetable Seeds",
    section: "Seeds & Bulbs",
    description: "Vegetable seeds for home gardening.",
    order: 180,
    aliases: ["vegetable seed", "veggie seeds"],
  },
  {
    key: "herb-seeds",
    label: "Herb Seeds",
    section: "Seeds & Bulbs",
    description: "Herb seeds for kitchen gardens.",
    order: 190,
    aliases: ["herb seed"],
  },
  {
    key: "microgreen-seeds",
    label: "Microgreen Seeds",
    section: "Seeds & Bulbs",
    description: "Quick-growing microgreen seed packs.",
    order: 200,
    aliases: ["microgreen"],
  },
  {
    key: "fruit-seeds",
    label: "Fruit Seeds",
    section: "Seeds & Bulbs",
    description: "Fruit seed varieties.",
    order: 210,
    aliases: ["fruit seed"],
  },
  {
    key: "tree-grass-seeds",
    label: "Tree & Grass Seeds",
    section: "Seeds & Bulbs",
    description: "Tree and turf seed options.",
    order: 220,
    aliases: ["tree seeds", "grass seeds"],
  },
  {
    key: "flower-bulbs",
    label: "Flower Bulbs",
    section: "Seeds & Bulbs",
    description: "Bulbs for seasonal and ornamental flowers.",
    order: 230,
    aliases: ["bulbs", "flower bulb"],
  },
  {
    key: "seed-kits",
    label: "Seed Kits",
    section: "Seeds & Bulbs",
    description: "Beginner kits with seeds and instructions.",
    order: 240,
    aliases: ["seed kit", "grow kit"],
  },
  {
    key: "ceramic-pots",
    label: "Ceramic Pots",
    section: "Pots & Planters",
    description: "Decorative ceramic planters and pots.",
    order: 250,
    aliases: ["ceramic pot", "pots"],
  },
  {
    key: "plastic-pots",
    label: "Plastic Pots",
    section: "Pots & Planters",
    description: "Durable plastic pots for daily gardening.",
    order: 260,
    aliases: ["plastic pot"],
  },
  {
    key: "metal-planters",
    label: "Metal Planters",
    section: "Pots & Planters",
    description: "Modern metal planters and containers.",
    order: 270,
    aliases: ["metal planter", "planters"],
  },
  {
    key: "wooden-planters",
    label: "Wooden Planters",
    section: "Pots & Planters",
    description: "Natural wooden planter collections.",
    order: 280,
    aliases: ["wood planter"],
  },
  {
    key: "hanging-planters",
    label: "Hanging Planters",
    section: "Pots & Planters",
    description: "Ceiling and wall-hanging planter options.",
    order: 290,
    aliases: ["hanging planter"],
  },
  {
    key: "basket-planters",
    label: "Basket Planters",
    section: "Pots & Planters",
    description: "Woven and basket-style planters.",
    order: 300,
    aliases: ["basket planter"],
  },
  {
    key: "plant-stands",
    label: "Plant Stands",
    section: "Pots & Planters",
    description: "Stands and risers for better display.",
    order: 310,
    aliases: ["stand", "plant stand"],
  },
  {
    key: "seedling-trays",
    label: "Seedling Trays",
    section: "Pots & Planters",
    description: "Trays for germination and nursery use.",
    order: 320,
    aliases: ["seed tray", "nursery tray"],
  },
  {
    key: "potting-soil",
    label: "Potting Soil",
    section: "Plant Care",
    description: "Soil and growing media blends.",
    order: 330,
    aliases: ["soil", "potting mix"],
  },
  {
    key: "fertilizers",
    label: "Fertilizers",
    section: "Plant Care",
    description: "Organic and specialty plant nutrition.",
    order: 340,
    aliases: ["fertilizer", "plant food"],
  },
  {
    key: "gardening-tools",
    label: "Gardening Tools",
    section: "Plant Care",
    description: "Essential tools for daily plant care.",
    order: 350,
    aliases: ["tools", "garden tools"],
  },
  {
    key: "grow-accessories",
    label: "Grow Accessories",
    section: "Plant Care",
    description: "Support accessories like sprays and ties.",
    order: 360,
    aliases: ["accessories", "care tools"],
  },
  {
    key: "combo-kits",
    label: "Combo Kits",
    section: "Lifestyle",
    description: "Plant bundles and combo packs.",
    order: 370,
    aliases: ["combo", "bundle", "bundles"],
  },
  {
    key: "gifting",
    label: "Gifting",
    section: "Lifestyle",
    description: "Gift-ready plants and green hampers.",
    order: 380,
    aliases: ["gift", "gift kit"],
  },
  {
    key: "new-arrivals",
    label: "New Arrivals",
    section: "Lifestyle",
    description: "Recently launched products and varieties.",
    order: 390,
    aliases: ["new"],
  },
];

const PRODUCT_TYPE_CATEGORY_FALLBACK = {
  live_plant: "indoor-plants",
  seed: "vegetable-seeds",
  bulb: "flower-bulbs",
  pot: "ceramic-pots",
  planter: "hanging-planters",
  soil: "potting-soil",
  fertilizer: "fertilizers",
  tool: "gardening-tools",
  combo: "combo-kits",
  gift_kit: "gifting",
  subscription: "combo-kits",
};

const normalizeCategoryKey = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const CATEGORY_BY_KEY = new Map();
const CATEGORY_BY_LABEL = new Map();

for (const category of CATALOG_CATEGORIES) {
  CATEGORY_BY_KEY.set(category.key, category);
  CATEGORY_BY_LABEL.set(normalizeCategoryKey(category.label), category);

  for (const alias of category.aliases || []) {
    CATEGORY_BY_LABEL.set(normalizeCategoryKey(alias), category);
  }
}

const getCatalogCategoryByKey = (key = "") =>
  CATEGORY_BY_KEY.get(normalizeCategoryKey(key)) || null;

const findCatalogCategory = ({ categoryKey, category } = {}) => {
  const fromKey = getCatalogCategoryByKey(categoryKey);
  if (fromKey) return fromKey;

  const normalizedLabel = normalizeCategoryKey(category);
  if (normalizedLabel && CATEGORY_BY_LABEL.has(normalizedLabel)) {
    return CATEGORY_BY_LABEL.get(normalizedLabel);
  }

  return null;
};

const resolveCatalogCategory = ({ categoryKey, category, productType } = {}) => {
  const matchedCategory = findCatalogCategory({ categoryKey, category });
  if (matchedCategory) return matchedCategory;

  const fallbackKey = PRODUCT_TYPE_CATEGORY_FALLBACK[productType] || "indoor-plants";
  return getCatalogCategoryByKey(fallbackKey);
};

export {
  CATALOG_CATEGORIES,
  findCatalogCategory,
  PRODUCT_TYPE_CATEGORY_FALLBACK,
  getCatalogCategoryByKey,
  normalizeCategoryKey,
  resolveCatalogCategory,
};
