// Garment types per audience — replaces the old catch-all "Clothing"
// subcategory, which was useless once nearly everything on the site was
// clothing. Kept in sync by hand with the sub_category enum in
// backend/models/productModel.js.
export const GARMENT_TYPES_BY_CATEGORY = {
  women: [
    "Saree",
    "Lehenga",
    "Anarkali",
    "Kurta Set",
    "Indo-Western",
    "Gown",
    "Cocktail Dress",
    "Co-ord Set",
  ],
  men: [
    "Sherwani",
    "Bandhgala",
    "Kurta Set",
    "Nehru Jacket",
    "Dhoti Set",
    "Suit",
    "Blazer",
  ],
  kids: [
    "Lehenga Set",
    "Sherwani",
    "Dhoti Kurta",
    "Gown",
    "Tuxedo Set",
    "Birthday Outfit",
  ],
};

// Subcategories that aren't a garment type, so they apply the same way
// across every audience.
export const NON_GARMENT_SUBCATEGORIES = ["Accessories", "Footwear", "Costumes"];
