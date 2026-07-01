const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');

const sarees = [
  // 1. Kalyani cotton saree
  {
    _id: "saree_kalyani_1",
    name: "Classic Crimson Kalyani Cotton Saree",
    category: "kalyani-cotton-saree",
    subcategory: "zari",
    size: "Free Size (5.5m + Blouse)",
    price: 1850,
    discountPrice: 1490,
    discountPercent: 19,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800"
    ],
    stock: 5,
    material: "Fabric: Authentic Kalyani Cotton\nBorder: Golden Zari Borders",
    overview: "A majestic crimson saree handcrafted in traditional Kalyani Cotton. Features a rich golden zari border and a heavily detailed pallu, making it perfect for both formal gatherings and festive occasions.",
    shippingRefund: "Exchange/Return can be initiated within 3 days of delivery. Merchandize must be unused and in original condition.",
    sizeFit: "Length: 5.5 Meters Saree\nBlouse: 80cm matching blouse piece included",
    careGuide: "Handwash separately with mild detergent in cold water.\nDry in shade.\nIron on medium heat."
  },
  {
    _id: "saree_kalyani_2",
    name: "Emerald Forest Kalyani Cotton Saree",
    category: "kalyani-cotton-saree",
    subcategory: "zari",
    size: "Free Size (5.5m + Blouse)",
    price: 1850,
    discountPrice: 1490,
    discountPercent: 19,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800"
    ],
    stock: 4,
    material: "Fabric: Pure Kalyani Cotton\nWeave: Handloom\nDetails: Golden zari borders",
    overview: "Celebrate timeless tradition with this beautiful Emerald Green Kalyani Cotton Saree. Perfect drape that flows elegantly with a soft texture that keeps you comfortable throughout the day.",
    shippingRefund: "Exchange/Return can be initiated within 3 days of delivery.",
    sizeFit: "Length: 5.5 Meters Saree\nBlouse: 80cm matching blouse piece included",
    careGuide: "Handwash separately with mild detergent in cold water."
  },

  // 2. Khadi Embroidery saree
  {
    _id: "saree_khadi_1",
    name: "Ivory Floral Khadi Embroidery Saree",
    category: "khadi-embroidery-saree",
    subcategory: "embroidered",
    size: "Free Size (5.5m + Blouse)",
    price: 2400,
    discountPrice: 1990,
    discountPercent: 17,
    image: "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?q=80&w=800"
    ],
    stock: 3,
    material: "Fabric: Pure Handspun Khadi Cotton\nWork: Hand-embroidered floral motifs",
    overview: "Elevate your handloom collection with this elegant Ivory Khadi Cotton Saree, featuring detailed multi-color floral embroidery along the borders and pallu.",
    shippingRefund: "Exchange/Return can be initiated within 3 days.",
    sizeFit: "Length: 5.5 Meters Saree\nBlouse: 80cm matching plain Khadi blouse piece included",
    careGuide: "Handwash separately in cold water. Iron on high heat."
  },
  {
    _id: "saree_khadi_2",
    name: "Mustard Peacock Khadi Embroidery Saree",
    category: "khadi-embroidery-saree",
    subcategory: "embroidered",
    size: "Free Size (5.5m + Blouse)",
    price: 2500,
    discountPrice: 2100,
    discountPercent: 16,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
    ],
    stock: 5,
    material: "Fabric: Handwoven Khadi Silk-Cotton Blend\nWork: Peacock motif thread embroidery",
    overview: "Vibrant mustard gold base adorned with traditional peacock thread embroidery. A lovely mix of rustic khadi and festive silk sheen.",
    shippingRefund: "Exchange/Return can be initiated within 3 days.",
    sizeFit: "Length: 5.5 Meters Saree\nBlouse: 80cm contrasting dark blue blouse piece included",
    careGuide: "Dry clean recommended."
  },

  // 3. Mul cotton saree
  {
    _id: "saree_mul_1",
    name: "Indigo Block-Printed Mul Cotton Saree",
    category: "mul-cotton-saree",
    subcategory: "printed",
    size: "Free Size (5.5m + Blouse)",
    price: 1450,
    discountPrice: 1190,
    discountPercent: 18,
    image: "https://images.unsplash.com/photo-1610030470200-2d93e1112b32?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1610030470200-2d93e1112b32?q=80&w=800"
    ],
    stock: 12,
    material: "Fabric: 100% Superfine Mulmul Cotton\nPrint: Natural Indigo Hand-Block Prints",
    overview: "Wrap yourself in the cloud-like softness of pure Mul cotton. Featuring traditional block-printing in indigo blue, this lightweight saree is the ultimate choice for daily wear.",
    shippingRefund: "Exchange/Return can be initiated within 3 days.",
    sizeFit: "Length: 5.5 Meters Saree\nBlouse: 80cm matching blouse piece included",
    careGuide: "Gentle machine wash or hand wash with mild detergents."
  },
  {
    _id: "saree_mul_2",
    name: "Peach Blossom Mul Cotton Saree",
    category: "mul-cotton-saree",
    subcategory: "printed",
    size: "Free Size (5.5m + Blouse)",
    price: 1450,
    discountPrice: 1190,
    discountPercent: 18,
    image: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=800"
    ],
    stock: 8,
    material: "Fabric: 100% Pure Soft Mulmul Cotton\nPrint: Floral Block Print",
    overview: "Delicate pastel peach base adorned with soft pink floral jaal block prints. Incredibly lightweight and soft on the skin.",
    shippingRefund: "Exchange/Return can be initiated within 3 days.",
    sizeFit: "Length: 5.5 Meters Saree\nBlouse: 80cm matching blouse piece included",
    careGuide: "Gentle machine wash."
  },

  // 4. Gini tissue saree
  {
    _id: "saree_tissue_1",
    name: "Golden Shimmer Gini Tissue Saree",
    category: "gini-tissue-saree",
    subcategory: "festive",
    size: "Free Size (5.5m + Blouse)",
    price: 4500,
    discountPrice: 3890,
    discountPercent: 14,
    image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=800"
    ],
    stock: 2,
    material: "Fabric: Silk-Tissue Mix\nWeave: Gini metallic golden thread weaves",
    overview: "Drape yourself in royal elegance with this Gini Tissue Saree. It reflects light beautifully and has a crisp shape that creates a highly premium silhouette.",
    shippingRefund: "Exchange/Return can be initiated within 3 days.",
    sizeFit: "Length: 5.5 Meters Saree\nBlouse: 80cm running gold tissue blouse piece included",
    careGuide: "Dry clean only."
  },

  // 5. Plain soft silk saree
  {
    _id: "saree_plain_silk_1",
    name: "Pastel Pink Plain Soft Silk Saree",
    category: "plain-soft-silk-saree",
    subcategory: "soft-silk",
    size: "Free Size (5.5m + Blouse)",
    price: 3800,
    discountPrice: 3200,
    discountPercent: 15,
    image: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=800"
    ],
    stock: 4,
    material: "Fabric: Pure Soft Silk (Plain body with thin zari line)",
    overview: "Minimalism meets luxury. This plain soft silk saree in a delicate pastel pink shade flows effortlessly and features a high-grade sheen.",
    shippingRefund: "Exchange/Return can be initiated within 3 days.",
    sizeFit: "Length: 5.5 Meters Saree\nBlouse: 80cm matching soft silk blouse piece",
    careGuide: "Dry clean only."
  },
  {
    _id: "saree_plain_silk_2",
    name: "Midnight Blue Plain Soft Silk Saree",
    category: "plain-soft-silk-saree",
    subcategory: "soft-silk",
    size: "Free Size (5.5m + Blouse)",
    price: 3800,
    discountPrice: 3200,
    discountPercent: 15,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"
    ],
    stock: 3,
    material: "Fabric: 100% Pure Soft Silk",
    overview: "A rich Midnight Blue silk saree with a completely plain body and a simple gold line border. Perfect for modern, sophisticated evening events.",
    shippingRefund: "Exchange/Return can be initiated within 3 days.",
    sizeFit: "Length: 5.5 Meters Saree\nBlouse: 80cm brocade blouse piece included",
    careGuide: "Dry clean only."
  },

  // 6. Border less soft silk saree
  {
    _id: "saree_borderless_silk_1",
    name: "Borderless Lavender Soft Silk Saree",
    category: "border-less-soft-silk-saree",
    subcategory: "soft-silk",
    size: "Free Size (5.5m + Blouse)",
    price: 4200,
    discountPrice: 3500,
    discountPercent: 16,
    image: "https://images.unsplash.com/photo-1625733143873-d8ec459a110a?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1625733143873-d8ec459a110a?q=80&w=800"
    ],
    stock: 3,
    material: "Fabric: Pure Borderless Soft Silk\nWeave: Dual-tone thread weaves",
    overview: "A contemporary borderless design in lavender, creating a continuous, seamless drape. Features delicate silver thread motifs on the pallu.",
    shippingRefund: "Exchange/Return can be initiated within 3 days.",
    sizeFit: "Length: 5.5 Meters Saree\nBlouse: 80cm contrasting magenta blouse piece",
    careGuide: "Dry clean only."
  },

  // 7. Champion silk saree
  {
    _id: "saree_champion_silk_1",
    name: "Sunset Orange Champion Silk Saree",
    category: "champion-silk-saree",
    subcategory: "champion-silk",
    size: "Free Size (5.5m + Blouse)",
    price: 4600,
    discountPrice: 3900,
    discountPercent: 15,
    image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=800"
    ],
    stock: 2,
    material: "Fabric: Premium Champion Silk\nBorder: Bold temple border design",
    overview: "A premium heavy silk saree with high luster and traditional temple borders. Drapes with structural definition, ideal for weddings.",
    shippingRefund: "Exchange/Return can be initiated within 3 days.",
    sizeFit: "Length: 5.5 Meters Saree\nBlouse: 80cm designer heavy blouse piece",
    careGuide: "Dry clean only."
  },

  // 8. Soft silk saree
  {
    _id: "saree_soft_silk_1",
    name: "Royal Wine Soft Silk Saree",
    category: "soft-silk-saree",
    subcategory: "soft-silk",
    size: "Free Size (5.5m + Blouse)",
    price: 3500,
    discountPrice: 2990,
    discountPercent: 14,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
    ],
    stock: 5,
    material: "Fabric: Handloom Soft Silk\nBorder: Antique gold zari border",
    overview: "Elegant royal wine shade featuring antique gold zari weaves. Standard soft silk texture that wraps comfortably like a second skin.",
    shippingRefund: "Exchange/Return can be initiated within 3 days.",
    sizeFit: "Length: 5.5 Meters Saree\nBlouse: 80cm matching zari blouse piece",
    careGuide: "Dry clean only."
  },

  // 9. Ds Kottanchi saree
  {
    _id: "saree_kottanchi_1",
    name: "Earthy Terracotta Ds Kottanchi Saree",
    category: "ds-kottanchi-saree",
    subcategory: "kottanchi",
    size: "Free Size (5.5m + Blouse)",
    price: 2800,
    discountPrice: 2300,
    discountPercent: 17,
    image: "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?q=80&w=800"
    ],
    stock: 4,
    material: "Fabric: Traditional Kottanchi Handloom Cotton\nDyes: 100% Organic Earth Dyes",
    overview: "A rare handloom Kottanchi cotton saree featuring unique grid patterns and organic terracotta shades. Highly breathable and historically unique.",
    shippingRefund: "Exchange/Return can be initiated within 3 days.",
    sizeFit: "Length: 5.5 Meters Saree\nBlouse: 80cm plain running cotton blouse piece",
    careGuide: "Handwash in cold water separately. Dry in shade."
  }
];

function seedDatabase() {
  const dbData = {
    users: [],
    products: sarees,
    cart: [],
    wishlist: [],
    addresses: [],
    orders: [],
    reviews: []
  };

  try {
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
    console.log(`Database successfully seeded with ${sarees.length} Saree products across 9 categories!`);
  } catch (error) {
    console.error('Error seeding database with Saree products:', error);
  }
}

seedDatabase();
