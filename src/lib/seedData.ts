import {
  Banner,
  Category,
  Coupon,
  Product,
  Review,
  SiteSettings,
} from '../types';

export interface GroomingConcernItem {
  id: string;
  title: string;
  concernQuery: string;
  subtitle: string;
  image: string;
}

export const INITIAL_SETTINGS: SiteSettings = {
  brandName: 'CARTLANE',
  tagline: "Premium Men's Grooming & Fine Perfumery",
  announcementText:
    'WELCOME TO CARTLANE · FLAT 15% OFF ON ORDERS ABOVE ₹999 (CODE: ROYAL15) · FREE SHIPPING ABOVE ₹599',
  announcementLink: '/offers',
  supportEmail: 'support@cartlane.in',
  supportPhone: '+91 11 4123 9800',
  supportHours: 'Mon – Sat · 09:30 AM to 07:30 PM IST',
  freeShippingThreshold: 599,
  standardShippingFee: 69,
  codEnabled: true,
  codFee: 0,
  estimatedDeliveryDays: '2–4 Business Days Across India',
  returnWindowDays: 7,
  socialInstagram: 'https://instagram.com',
  socialYoutube: 'https://youtube.com',
  socialTwitter: 'https://x.com',
  updatedAt: '2025-05-01T00:00:00.000Z',
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat_fragrance',
    slug: 'fragrance',
    name: 'Perfumes & Fragrances',
    description:
      'Long-lasting Eau De Parfums and Eau De Toilettes crafted with exotic French essential oils for everyday and evening signature wear.',
    image:
      'https://www.themancompany.com/cdn/shop/files/Product_Card_1_5b28ad29-735c-401e-8a55-9ebea19a2716.png?v=1769162822',
    order: 1,
    featured: true,
  },
  {
    id: 'cat_beard',
    slug: 'beard-care',
    name: 'Beard Care',
    description:
      '100% natural cold-pressed Almond, Thyme, Argan, and Rosemary formulations for fuller, softer, and itch-free beard growth.',
    image:
      'https://www.themancompany.com/cdn/shop/files/Product_Card_2_869269d1-2933-416d-8212-0a95b4bd13be.png?v=1769162821',
    order: 2,
    featured: true,
  },
  {
    id: 'cat_face',
    slug: 'face-skin',
    name: 'Face & Skin Care',
    description:
      'Activated Charcoal cleansers, 10% Vitamin C serums, Salicylic Acid anti-acne treatments, and SPF 50 PA++++ sunscreen gels.',
    image:
      'https://www.themancompany.com/cdn/shop/files/Product_Card_3.png?v=1769162821',
    order: 3,
    featured: true,
  },
  {
    id: 'cat_body',
    slug: 'body-shave',
    name: 'Body & Shave',
    description:
      'Ultra-rich Glycerin & Vitamin E shaving foams, charcoal body washes, and refreshing post-shave botanical care.',
    image:
      'https://www.themancompany.com/cdn/shop/files/Product_Card_5.png?v=1769163031',
    order: 4,
    featured: true,
  },
  {
    id: 'cat_hair',
    slug: 'hair-care',
    name: 'Hair Growth & Care',
    description:
      'Clinical hair growth serums, Titanium Derma Rollers, and Redensyl fortifying regimens to combat hair fall and thinning.',
    image:
      'https://www.themancompany.com/cdn/shop/files/Product_Card_10.png?v=1774859502',
    order: 5,
    featured: true,
  },
  {
    id: 'cat_kits',
    slug: 'kits-combos',
    name: 'Gifting & Combos',
    description:
      'Luxury grooming gift boxes, Blanc Curation Coffrets, and Party Starter perfume ensembles designed for every occasion.',
    image:
      'https://www.themancompany.com/cdn/shop/files/Accessories_Category_Tile_34045f99-71e0-4d05-95a4-0a945db23d29.png?v=1769163031',
    order: 6,
    featured: true,
  },
];

export const SHOP_BY_CONCERNS: GroomingConcernItem[] = [
  {
    id: 'concern_acne',
    title: 'Oily Skin & Acne',
    concernQuery: 'Oil Control',
    subtitle: 'Charcoal + 2% Salicylic Acid',
    image:
      'https://www.themancompany.com/cdn/shop/files/oily-skin-and-acne-mobile-nav.png?v=12137488832649643697',
  },
  {
    id: 'concern_tan',
    title: 'Tanned & Dull Skin',
    concernQuery: 'Brightening & De-Tan',
    subtitle: '10% Vitamin C + SPF 50 PA++++',
    image:
      'https://www.themancompany.com/cdn/shop/files/tanned-skin-mobile-nav.png?v=8383187877499470923',
  },
  {
    id: 'concern_hairfall',
    title: 'Hair Fall & Growth',
    concernQuery: 'Hair Fall Control',
    subtitle: 'Derma Roller + Growth Serum',
    image:
      'https://www.themancompany.com/cdn/shop/files/hair-fall-and-hair-growth-mobile-nav.png?v=13339613703340322473',
  },
  {
    id: 'concern_odour',
    title: 'Long-Lasting Fragrance',
    concernQuery: 'Long-Lasting Fragrance',
    subtitle: 'Fine Eau De Parfum & EDT',
    image:
      'https://www.themancompany.com/cdn/shop/files/body-odour-mobile-nav.png?v=4252273053181015092',
  },
  {
    id: 'concern_beard',
    title: 'Patchy Beard Growth',
    concernQuery: 'Patchy Beard & Softening',
    subtitle: 'Almond, Thyme & Rosemary',
    image:
      'https://www.themancompany.com/cdn/shop/files/dandruff-mobile-nav.png?v=10668242247931898156',
  },
  {
    id: 'concern_blackheads',
    title: 'Blackheads & Pores',
    concernQuery: 'Oil Control',
    subtitle: 'Activated Charcoal & Niacinamide',
    image:
      'https://www.themancompany.com/cdn/shop/files/blackheads-mobile-nav.png?v=523986351837294247',
  },
  {
    id: 'concern_shave',
    title: 'Razor Burn & Dryness',
    concernQuery: 'Razor Burn & Dryness',
    subtitle: 'Glycerin, Aloe & Vitamin E',
    image:
      'https://www.themancompany.com/cdn/shop/files/dark-lips-mobile-nav.png?v=10096679768822415092',
  },
  {
    id: 'concern_gifting',
    title: 'Luxury Gifting Kits',
    concernQuery: 'Complete Grooming Regimen',
    subtitle: 'Curated 4-in-1 Gift Boxes',
    image:
      'https://www.themancompany.com/cdn/shop/files/grey-hairs-mobile-nav.png?v=12176264644226174658',
  },
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner_hero_1',
    title: 'Signature Eau De Parfum Collection — Crafted for Gentlemen',
    subtitle:
      'High-concentration French fragrances including Black, Blanc, Aqua Noir, Citron, and Titanium. Up to 55% OFF on signature bottles.',
    ctaText: 'Shop Fine Fragrances',
    ctaLink: '/collections/fragrance',
    image:
      'https://www.themancompany.com/cdn/shop/files/Website_Banner_1.jpg?v=1792572562',
    placement: 'hero',
    active: true,
    order: 1,
  },
  {
    id: 'banner_hero_2',
    title: 'Activated Charcoal & Active Skincare Regimen',
    subtitle:
      'Charcoal + Niacinamide Face Wash, 10% Vitamin C Face Serum, 2% Salicylic Acid Serum, and SPF 50 PA++++ Sunscreen Gel.',
    ctaText: 'Explore Face Care',
    ctaLink: '/collections/face-skin',
    image:
      'https://www.themancompany.com/cdn/shop/files/Website_Banner_2.jpg?v=1792572703',
    placement: 'hero',
    active: true,
    order: 2,
  },
  {
    id: 'banner_hero_3',
    title: 'Beard & Hair Growth Botanical Solutions',
    subtitle:
      'Cold-pressed Almond & Thyme Beard Growth Oil and Derma Roller + Hair Growth Serum Booster Duo.',
    ctaText: 'Shop Beard & Hair',
    ctaLink: '/collections/beard-care',
    image:
      'https://www.themancompany.com/cdn/shop/files/Website_Banner_3.jpg?v=1792651403',
    placement: 'hero',
    active: true,
    order: 3,
  },
  {
    id: 'banner_hero_4',
    title: 'Luxury Grooming Gift Kits & Curation Boxes',
    subtitle:
      'Unbox the Blanc 4-Piece Curation Kit or the Noir Party Starter Gift Set — up to 65% OFF.',
    ctaText: 'Explore Gift Kits',
    ctaLink: '/collections/kits-combos',
    image:
      'https://www.themancompany.com/cdn/shop/files/Website_Banner_4.jpg?v=1792735907',
    placement: 'hero',
    active: true,
    order: 4,
  },
  {
    id: 'banner_promo_1',
    title: 'Build Your Own Grooming Box — Save Up to 60%',
    subtitle:
      'Pair your signature Eau De Parfum with Charcoal Cleansers and Vitamin C Serums. Use code ROYAL15 at checkout.',
    ctaText: 'Explore Combos & Kits',
    ctaLink: '/collections/kits-combos',
    image:
      'https://www.themancompany.com/cdn/shop/files/BYRB_Homepage_Tile.png?v=1776147110',
    placement: 'promo',
    active: true,
    order: 5,
  },
  {
    id: 'banner_promo_2',
    title: 'Clinical Face Serums & SPF 50 Sun Protection',
    subtitle:
      'Zero white-cast Moisturising Sunscreen Gel SPF 50 PA++++ paired with 10% Stable Vitamin C & 2% Salicylic Acid.',
    ctaText: 'Shop Active Skincare',
    ctaLink: '/collections/face-skin',
    image:
      'https://www.themancompany.com/cdn/shop/files/Category_Tiles_8.jpg?v=1792572095',
    placement: 'promo',
    active: true,
    order: 6,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_charcoal_fw',
    slug: 'charcoal-face-wash-niacinamide',
    name: 'Charcoal Face Wash for Men – Charcoal & Niacinamide | Oil Control',
    shortDescription:
      '100g · Activated Charcoal, Niacinamide, Ylang-Ylang & Lemongrass · Deep Pore Detox',
    description:
      'Refresh, detox, and energise your skin with the Charcoal Face Wash for Men, formulated specifically for tough, oil-prone male skin. Powered by Activated Charcoal and Niacinamide, this deep-cleansing face wash draws out dirt, excess oil, pollution, and dead skin cells from deep within pores without stripping moisture. Enriched with Ylang-Ylang and Lemongrass essential oils, it helps unclog pores, reduce blackheads, and leave your skin feeling fresh, clear, and balanced after every wash.',
    category: 'face-skin',
    subcategory: 'Face Wash',
    concern: 'Oil Control',
    price: 209,
    compareAtPrice: 259,
    discountPercent: 19,
    sku: 'TMC-WEB-60T',
    stock: 145,
    mainImage:
      'https://cdn.shopify.com/s/files/1/1188/2592/files/Charcoal_Face_Wash_1100x1100_0.jpg?v=1773741739',
    imageAlt: 'Charcoal Face Wash for Men – Charcoal & Niacinamide 100g Tube',
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/Charcoal_Face_Wash_1100x1100_0.jpg?v=1773741739',
        alt: 'Charcoal Face Wash Front Pack',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/Charcoal_Face_Wash_1100x1100_00.jpg?v=1773741739',
        alt: 'Charcoal Face Wash Key Benefits',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/Charcoal_Face_Wash_1100x1100_1.jpg?v=1773741739',
        alt: 'Activated Charcoal & Niacinamide Action',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/Charcoal_Face_Wash_1100x1100_4.jpg?v=1773741739',
        alt: 'How to Use Charcoal Face Wash',
      },
    ],
    variants: [
      {
        id: 'var_charcoal_100g',
        label: '100g Tube',
        price: 209,
        compareAtPrice: 259,
        sku: 'TMC-WEB-60T',
        stock: 145,
      },
      {
        id: 'var_charcoal_pack2',
        label: 'Pack of 2 (200g)',
        price: 389,
        compareAtPrice: 518,
        sku: 'TMC-WEB-60T-2',
        stock: 60,
      },
    ],
    highlights: [
      'Deeply cleanses pores and removes urban pollution & grime',
      'Controls excess sebum and prevents blackheads & breakouts',
      'Niacinamide refines skin texture and brightens dull tone',
      'Enriched with Ylang-Ylang & Lemongrass essential oils',
    ],
    ingredients:
      'Activated Bamboo Charcoal, Niacinamide (Vitamin B3), Ylang-Ylang Essential Oil, Lemongrass Oil, Botanical Glycerin, Purified Aqua.',
    usageInstructions:
      'Splash face with lukewarm water. Massage a coin-sized amount in circular motions over the face and neck for 45 seconds. Rinse thoroughly.',
    ratingAvg: 4.8,
    reviewCount: 312,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: false,
    status: 'published',
    createdAt: '2025-01-05T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    id: 'prod_edp_black',
    slug: 'eau-de-parfum-black-100ml',
    name: 'Eau De Parfum | Black (100ml)',
    shortDescription:
      '100ml · Lemon, Mint, Jasmine & Sandalwood · Fresh Aromatic Signature EDP',
    description:
      'A fragrance crafted for the man who owns every room he walks into. Eau De Parfum Black opens with an invigorating burst of Lemon, Mint, and Lavender, evolving into a refined heart of Jasmine, Geranium, and Warm Spices, before settling into a sensual, long-lasting base of Sandalwood and Cedarwood. Engineered with high perfume oil concentration for commanding all-day wear.',
    category: 'fragrance',
    subcategory: 'Eau De Parfum',
    concern: 'Long-Lasting Fragrance',
    price: 649,
    compareAtPrice: 849,
    discountPercent: 24,
    sku: 'TMC-WEB-4490',
    stock: 92,
    mainImage:
      'https://cdn.shopify.com/s/files/1/1188/2592/files/1_a4d86dd8-b98e-472d-aed2-9ed905ab21e5.jpg?v=1784194206',
    imageAlt: 'Eau De Parfum Black 100ml Bottle',
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/1_a4d86dd8-b98e-472d-aed2-9ed905ab21e5.jpg?v=1784194206',
        alt: 'Eau De Parfum Black 100ml Primary Flacon',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/2_e9f0dc73-9d0d-4292-bf16-1953f59de4e9.jpg?v=1784194206',
        alt: 'Eau De Parfum Black Fragrance Notes',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/3_c35b0047-98b7-4c75-a05b-1f133b60d4ac.jpg?v=1784194206',
        alt: 'Eau De Parfum Black Longevity & Projection',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/4_31015b70-9c74-4bf0-b5e7-3e46a348b0cc.jpg?v=1784194206',
        alt: 'Eau De Parfum Black Packaging Presentation',
      },
    ],
    variants: [
      {
        id: 'var_black_100ml',
        label: '100ml Flacon',
        price: 649,
        compareAtPrice: 849,
        sku: 'TMC-WEB-4490',
        stock: 92,
      },
    ],
    highlights: [
      'Top Notes: Zesty Lemon, Crushed Mint & French Lavender',
      'Heart Notes: Warm Spices, Geranium & Night Jasmine',
      'Base Notes: Creamy Sandalwood, Amber & Atlas Cedar',
      'Long-lasting Eau De Parfum concentration for office & evening wear',
    ],
    ingredients:
      'Denatured Ethyl Alcohol (95% v/v), IFRA-Certified Fragrance Oils (Lemon, Mint, Lavender, Geranium, Sandalwood), Aqua, BHT.',
    usageInstructions:
      'Hold bottle 15cm from skin and spray 3–4 times across pulse points: collarbones, wrists, and behind the ears.',
    ratingAvg: 4.9,
    reviewCount: 248,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: false,
    status: 'published',
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    id: 'prod_edt_blanc',
    slug: 'eau-de-toilette-blanc-100ml',
    name: 'Eau De Toilette | Blanc (100ml)',
    shortDescription:
      '100ml · Lemon, Birch Leaves, Cardamom, Lavender & Musk · Crisp Citrus Musky Scent',
    description:
      'Blanc is our iconic citrus-musky bestseller crafted for effortless everyday sophistication. It opens with a crisp, sun-drenched fusion of Lemon, Birch Leaves, and Cardamom, transitioning into a cool aromatic heart of Lavender, Geranium, and Juniper, and resting on a warm, magnetic foundation of Sandalwood, Amberwood, and White Musk.',
    category: 'fragrance',
    subcategory: 'Eau De Toilette',
    concern: 'Long-Lasting Fragrance',
    price: 1599,
    compareAtPrice: 1799,
    discountPercent: 11,
    sku: 'TMC-WEB-14',
    stock: 74,
    mainImage:
      'https://cdn.shopify.com/s/files/1/1188/2592/files/1_cbbec69d-7198-4b58-9db5-70b1e495d1cc.jpg?v=1784634155',
    imageAlt: 'Eau De Toilette Blanc 100ml',
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/1_cbbec69d-7198-4b58-9db5-70b1e495d1cc.jpg?v=1784634155',
        alt: 'Blanc 100ml Signature White Bottle',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/2_abdfda1f-b70a-4781-a1e7-5982de352c4a.jpg?v=1784634155',
        alt: 'Blanc Olfactory Notes Breakdown',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/3_76c45166-267d-4dc6-b7a0-b5eb61890877.jpg?v=1784634155',
        alt: 'Blanc Everyday Freshness Profile',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/4_0bfac289-a2f1-462c-bd5c-880f239d108f.jpg?v=1784634155',
        alt: 'Blanc Luxury Presentation Box',
      },
    ],
    variants: [
      {
        id: 'var_blanc_100ml',
        label: '100ml Signature Flacon',
        price: 1599,
        compareAtPrice: 1799,
        sku: 'TMC-WEB-14',
        stock: 74,
      },
    ],
    highlights: [
      'Signature cult-favourite masculine fragrance for daytime elegance',
      'Top Notes: Lemon, Birch Leaves & Green Cardamom',
      'Heart Notes: French Lavender, Geranium & Crisp Juniper',
      'Base Notes: White Musk, Amberwood & Mysore Sandalwood',
    ],
    ingredients:
      'Denatured Ethyl Alcohol, Fine Perfume Essence (Lemon, Birch Leaf, Cardamom, Juniper, Sandalwood, White Musk), Aqua.',
    usageInstructions:
      'Mist onto clean, dry skin after showering, focusing on neck and wrists.',
    ratingAvg: 4.9,
    reviewCount: 418,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: false,
    status: 'published',
    createdAt: '2025-01-12T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    id: 'prod_beard_oil_almond',
    slug: 'beard-growth-oil-almond-thyme',
    name: 'Beard Growth Oil for Men | Almond & Thyme',
    shortDescription:
      '30ml · 100% Natural Cold-Pressed Sweet Almond, Thyme, Argan & Jojoba Oils',
    description:
      'Nourish patchy facial hair and tame unruly bristles with our signature Almond & Thyme Beard Growth Oil. Blended from 100% natural oils rich in Vitamin E and essential fatty acids, Sweet Almond oil deeply conditions the skin underneath while Thyme and Rosemary botanical extracts stimulate dormant follicles for a fuller, healthier, and softer mane.',
    category: 'beard-care',
    subcategory: 'Beard Oil',
    concern: 'Patchy Beard & Softening',
    price: 299,
    compareAtPrice: 349,
    discountPercent: 14,
    sku: 'TMC-WEB-4337',
    stock: 130,
    mainImage:
      'https://cdn.shopify.com/s/files/1/1188/2592/files/2_036a8667-49a1-4e8f-9b32-f9a65253ae34.jpg?v=1781769742',
    imageAlt: 'Beard Growth Oil for Men Almond & Thyme 30ml',
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/2_036a8667-49a1-4e8f-9b32-f9a65253ae34.jpg?v=1781769742',
        alt: 'Almond & Thyme Beard Growth Oil Dropper Bottle',
      },
    ],
    variants: [
      {
        id: 'var_beard_oil_30ml',
        label: '30ml Dropper',
        price: 299,
        compareAtPrice: 349,
        sku: 'TMC-WEB-4337',
        stock: 130,
      },
      {
        id: 'var_beard_oil_60ml',
        label: 'Pack of 2 (60ml)',
        price: 549,
        compareAtPrice: 698,
        sku: 'TMC-WEB-4337-2',
        stock: 48,
      },
    ],
    highlights: [
      'Promotes healthy, uniform beard growth and fills patchy areas',
      'Eliminates beard itch, flakiness, and coarse split ends',
      'Non-greasy fast-absorbing cold-pressed Almond & Thyme blend',
      '100% Free from Mineral Oil, Silicones, SLS & Parabens',
    ],
    ingredients:
      'Sweet Almond Oil (Prunus Amygdalus Dulcis), Thyme Essential Oil, Golden Jojoba Oil, Moroccan Argan Kernel Oil, Hazelnut Oil, Vitamin E.',
    usageInstructions:
      'Dispense 4–6 drops into your palm, rub hands together, and massage thoroughly into beard roots and shafts every morning and night.',
    ratingAvg: 4.8,
    reviewCount: 289,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: false,
    status: 'published',
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    id: 'prod_vitc_serum',
    slug: '10-vitamin-c-face-serum-hyaluronic-acid',
    name: '10% Vitamin C Face Serum for Men | Hyaluronic Acid & Zinc PCA',
    shortDescription:
      '30ml · 10% Stable Vitamin C (3-O-Ethyl Ascorbic Acid), Hyaluronic Acid & Niacinamide',
    description:
      'Restore skin radiance and erase stubborn sun tan and dark spots with our high-potency 10% Vitamin C Face Serum. Formulated with highly stable 3-O-Ethyl Ascorbic Acid, Hyaluronic Acid, Niacinamide, and Zinc PCA, this featherlight serum penetrates rapidly to boost collagen, hydrate dehydrated skin, and deliver a visibly brighter, even-toned complexion.',
    category: 'face-skin',
    subcategory: 'Face Serum',
    concern: 'Brightening & De-Tan',
    price: 324,
    compareAtPrice: 399,
    discountPercent: 19,
    sku: 'TMC-WEB-4357',
    stock: 115,
    mainImage:
      'https://cdn.shopify.com/s/files/1/1188/2592/files/1_ea35f594-c4e7-4625-aef8-a88ae96ecda7.png?v=1775563437',
    imageAlt: '10% Vitamin C Face Serum for Men 30ml',
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/1_ea35f594-c4e7-4625-aef8-a88ae96ecda7.png?v=1775563437',
        alt: '10% Vitamin C Face Serum Bottle & Box',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/2_e190b792-a37e-4b3a-8c36-fb8291fa08c3.png?v=1775563437',
        alt: 'Vitamin C + Hyaluronic Acid Ingredients',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/3_78db0b6e-d9a1-43be-bb2c-84ef69fd8d7f.png?v=1775563437',
        alt: 'Brightening & Anti-Pigmentation Results',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/4_ce7636ae-c783-4ca9-a52f-769c0d1f0a69.png?v=1775563437',
        alt: 'Daily Serum Application Routine',
      },
    ],
    variants: [
      {
        id: 'var_vitc_30ml',
        label: '30ml Dropper Bottle',
        price: 324,
        compareAtPrice: 399,
        sku: 'TMC-WEB-4357',
        stock: 115,
      },
    ],
    highlights: [
      '10% Stable Vitamin C visibly fades sun tan, dullness & dark spots',
      'Hyaluronic Acid locks in 24-hour oil-free hydration',
      'Zinc PCA & Niacinamide regulate sebum and tighten pores',
      'Dermatologically tested, non-sticky & suitable for all skin types',
    ],
    ingredients:
      '10% 3-O-Ethyl Ascorbic Acid (Vitamin C), Sodium Hyaluronate, Niacinamide, Zinc PCA, Moringa Seed Extract, Aloe Barbadensis Leaf Juice.',
    usageInstructions:
      'Apply 3–4 drops onto a cleansed face morning and night. Gently pat into skin before applying moisturiser or SPF 50 sunscreen.',
    ratingAvg: 4.8,
    reviewCount: 194,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: true,
    status: 'published',
    createdAt: '2025-01-20T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    id: 'prod_sunscreen_spf50',
    slug: 'moisturising-sunscreen-gel-spf50-pa4plus',
    name: 'Moisturising Sunscreen Gel for Men | SPF50 PA++++',
    shortDescription:
      '50g · Broad Spectrum UVA/UVB Protection · Sea Buckthorn, Allantoin & Zero White Cast',
    description:
      'Engineered specifically for men who hate heavy, chalky sunscreens. Our Moisturising Sunscreen Gel SPF 50 PA++++ delivers maximum broad-spectrum UVA & UVB defence in an ultra-lightweight, water-gel texture that absorbs in seconds with zero white cast and zero greasiness. Infused with Sea Buckthorn Oil and Allantoin to soothe sun-stressed skin.',
    category: 'face-skin',
    subcategory: 'Sunscreen',
    concern: 'Brightening & De-Tan',
    price: 335,
    compareAtPrice: 399,
    discountPercent: 16,
    sku: 'TMC-WEB-4363',
    stock: 108,
    mainImage:
      'https://cdn.shopify.com/s/files/1/1188/2592/files/NewSunscreenGel1.jpg?v=1774246168',
    imageAlt: 'Moisturising Sunscreen Gel for Men SPF50 PA++++ 50g',
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/NewSunscreenGel1.jpg?v=1774246168',
        alt: 'SPF 50 PA++++ Sunscreen Gel Tube',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/NewSunscreenGel2.jpg?v=1774246168',
        alt: 'Zero White Cast Lightweight Texture',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/NewSunscreenGel3.jpg?v=1774246168',
        alt: 'Broad Spectrum UVA & UVB Shield',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/NewSunscreenGel4.jpg?v=1774246168',
        alt: 'Sea Buckthorn & Allantoin Actives',
      },
    ],
    variants: [
      {
        id: 'var_spf50_50g',
        label: '50g Gel Tube',
        price: 335,
        compareAtPrice: 399,
        sku: 'TMC-WEB-4363',
        stock: 108,
      },
    ],
    highlights: [
      'High-performance SPF 50 PA++++ shields against tanning & photo-ageing',
      'Invisible gel finish — leaves zero white cast on beard or skin',
      'Oil-free, sweat-resistant & non-comedogenic formula',
      'Enriched with Sea Buckthorn, Hyaluronic Acid & Allantoin',
    ],
    ingredients:
      'Aqua, Octyl Methoxycinnamate, Butyl Methoxydibenzoylmethane, Sea Buckthorn Fruit Oil, Allantoin, Sodium Hyaluronate, Vitamin E.',
    usageInstructions:
      'Apply two finger-lengths of gel evenly across face, neck, and ears 15 minutes before sun exposure.',
    ratingAvg: 4.8,
    reviewCount: 162,
    isFeatured: true,
    isBestseller: false,
    isNewArrival: true,
    status: 'published',
    createdAt: '2025-01-25T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    id: 'prod_salicylic_serum',
    slug: '2-salicylic-acid-anti-acne-face-serum',
    name: '2% Salicylic Acid | Anti-Acne Face Serum',
    shortDescription:
      '30ml · 2% Salicylic Acid (BHA), Neem Extract & Tea Tree · Clears Active Acne & Pores',
    description:
      'Target stubborn acne, pimples, blackheads, and clogged pores at the root with our clinical 2% Salicylic Acid Anti-Acne Face Serum. As a beta-hydroxy acid (BHA), Salicylic Acid exfoliates deep inside oily pores to dissolve sebum plugs, while antibacterial Neem and Tea Tree extracts calm inflammation and prevent future breakouts.',
    category: 'face-skin',
    subcategory: 'Face Serum',
    concern: 'Oil Control',
    price: 349,
    compareAtPrice: 399,
    discountPercent: 13,
    sku: 'TMC-WEB-3846',
    stock: 86,
    mainImage:
      'https://cdn.shopify.com/s/files/1/1188/2592/files/1_aa076f60-fc8c-408b-939c-c1a39be30a79.png?v=1770979295',
    imageAlt: '2% Salicylic Acid Anti-Acne Face Serum 30ml',
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/1_aa076f60-fc8c-408b-939c-c1a39be30a79.png?v=1770979295',
        alt: '2% Salicylic Acid Anti-Acne Serum Primary',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/2_1360a0d5-6052-41bf-a056-7f5fb12ec955.png?v=1770979295',
        alt: 'Salicylic Acid Pore Clearing Action',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/3_79d7c5cb-b1dc-450b-8c34-66298899e771.png?v=1770979295',
        alt: 'Acne & Blackhead Reduction Benefits',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/4_09c9b4fb-6527-4490-8fd8-2d13d2f83412.png?v=1770979295',
        alt: 'How to Layer 2% Salicylic Acid Serum',
      },
    ],
    variants: [
      {
        id: 'var_salicylic_30ml',
        label: '30ml Dropper Bottle',
        price: 349,
        compareAtPrice: 399,
        sku: 'TMC-WEB-3846',
        stock: 86,
      },
    ],
    highlights: [
      '2% Encapsulated Salicylic Acid penetrates pores to clear active acne',
      'Dissolves blackheads, whiteheads, and excess T-zone oiliness',
      'Reduces post-acne marks and redness with Niacinamide & Cica',
      'Fragrance-free, paraben-free & clinically tested for acne-prone skin',
    ],
    ingredients:
      '2% Salicylic Acid, Niacinamide, Melaleuca Alternifolia (Tea Tree) Leaf Extract, Azadirachta Indica (Neem) Leaf Extract, Centella Asiatica.',
    usageInstructions:
      'Apply 2–3 drops on clean, dry face in the evening. Follow with a light non-comedogenic moisturiser and always wear SPF 50 during the day.',
    ratingAvg: 4.7,
    reviewCount: 141,
    isFeatured: false,
    isBestseller: false,
    isNewArrival: true,
    status: 'published',
    createdAt: '2025-01-28T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    id: 'prod_edp_aqua_noir',
    slug: 'eau-de-parfum-aqua-noir-50ml',
    name: 'Eau De Parfum | Aqua Noir (50ml)',
    shortDescription:
      '50ml · Marine Accord, Bergamot, Rosemary, Patchouli & Incense · Deep Oceanic EDP',
    description:
      'Dive into mystery and magnetic freshness with Eau De Parfum Aqua Noir. Inspired by dark ocean depths meeting coastal cliffs, it blends invigorating Marine Notes and Italian Bergamot with aromatic Rosemary and Sage, anchored by smoky Patchouli and Frankincense.',
    category: 'fragrance',
    subcategory: 'Eau De Parfum',
    concern: 'Long-Lasting Fragrance',
    price: 649,
    compareAtPrice: 749,
    discountPercent: 13,
    sku: 'TMC-WEB-4302',
    stock: 68,
    mainImage:
      'https://cdn.shopify.com/s/files/1/1188/2592/files/Aqua_Noir.jpg?v=1789731313',
    imageAlt: 'Eau De Parfum Aqua Noir 50ml',
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/Aqua_Noir.jpg?v=1789731313',
        alt: 'Eau De Parfum Aqua Noir 50ml Bottle',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/2_e1fa1c63-8824-4ca9-a52e-854261fd7c92.jpg?v=1789731313',
        alt: 'Aqua Noir Marine & Woody Notes',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/3_c1b0bc5a-e63f-4eb3-8481-60e55d0ffce0.jpg?v=1789731313',
        alt: 'Aqua Noir Long Lasting Performance',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/4_0bfee5e0-a20e-4821-b4e1-f6e2d2d937e5.jpg?v=1789731313',
        alt: 'Aqua Noir Gift Ready Box',
      },
    ],
    variants: [
      {
        id: 'var_aquanoir_50ml',
        label: '50ml EDP Flacon',
        price: 649,
        compareAtPrice: 749,
        sku: 'TMC-WEB-4302',
        stock: 68,
      },
    ],
    highlights: [
      'Sophisticated aquatic-woody profile for boardroom and evening wear',
      'Top Notes: Sea Breeze Accord & Calabrian Bergamot',
      'Heart Notes: Wild Rosemary, Clary Sage & Geranium',
      'Base Notes: Indonesian Patchouli, Amber & Smoky Incense',
    ],
    ingredients:
      'Ethyl Alcohol, Parfum (Fragrance), Aqua, Diethyl Phthalate, Limonene, Linalool.',
    usageInstructions:
      'Spray onto pulse points from a 15cm distance. Do not rub wrists together after spraying.',
    ratingAvg: 4.8,
    reviewCount: 119,
    isFeatured: true,
    isBestseller: false,
    isNewArrival: true,
    status: 'published',
    createdAt: '2025-02-01T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    id: 'prod_edp_citron',
    slug: 'eau-de-parfum-citron-100ml',
    name: 'Eau De Parfum | Citron (100ml)',
    shortDescription:
      '100ml · Sicilian Lemon, Bergamot, Mandarin, Neroli & Oakmoss · 40% OFF Limited Offer',
    description:
      'A vibrant Mediterranean citrus explosion built for energetic mornings and warm Indian summers. Eau De Parfum Citron pairs sun-ripened Sicilian Lemon, Bergamot, and Mandarin with crisp Neroli blossoms and an earthy, masculine dry-down of Vetiver and Oakmoss.',
    category: 'fragrance',
    subcategory: 'Eau De Parfum',
    concern: 'Long-Lasting Fragrance',
    price: 899,
    compareAtPrice: 1499,
    discountPercent: 40,
    sku: 'TMC-WEB-2092',
    stock: 82,
    mainImage:
      'https://cdn.shopify.com/s/files/1/1188/2592/files/1_6b03818a-8214-4207-a68b-f9cf74cc791e.png?v=1771235872',
    imageAlt: 'Eau De Parfum Citron 100ml',
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/1_6b03818a-8214-4207-a68b-f9cf74cc791e.png?v=1771235872',
        alt: 'Eau De Parfum Citron 100ml Bottle',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/2_e9207407-56b0-4274-96ee-96b850df4d84.png?v=1771235872',
        alt: 'Citron Citrus & Vetiver Notes',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/3_c35100aa-26b8-42c2-91e7-5fd890a6eb46.png?v=1771235872',
        alt: 'Citron Summer Freshness Longevity',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/4_0bf5905a-5d22-415a-9b3f-a791b8cf9c61.png?v=1771235872',
        alt: 'Citron Bottle Craftsmanship',
      },
    ],
    variants: [
      {
        id: 'var_citron_100ml',
        label: '100ml EDP Flacon',
        price: 899,
        compareAtPrice: 1499,
        sku: 'TMC-WEB-2092',
        stock: 82,
      },
    ],
    highlights: [
      'Energising high-projection citrus EDP tailored for warm weather',
      'Top Notes: Sicilian Lemon, Bergamot & Blood Mandarin',
      'Heart Notes: Tunisian Neroli, Black Pepper & Rosemary',
      'Base Notes: Haitian Vetiver, Oakmoss & White Cedar',
    ],
    ingredients:
      'Denatured Ethyl Alcohol, Fragrance (Citrus Limon, Bergamot, Neroli, Vetiver), Aqua.',
    usageInstructions:
      'Apply 4 sprays to neck and chest after your morning shower.',
    ratingAvg: 4.8,
    reviewCount: 176,
    isFeatured: false,
    isBestseller: true,
    isNewArrival: false,
    status: 'published',
    createdAt: '2025-02-04T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    id: 'prod_edp_titanium',
    slug: 'eau-de-parfum-titanium-50ml',
    name: 'Eau De Parfum | Titanium (50ml)',
    shortDescription:
      '50ml · Grapefruit, Pink Pepper, Leather & Vetiver · Bold Metallic Woody EDP',
    description:
      'Unbreakable, modern, and unapologetically bold. Eau De Parfum Titanium fuses electric Pink Pepper and Grapefruit with a masculine core of Nutmeg, Warm Leather, and Guaiac Wood. Designed for late-night soirées and high-stakes occasions.',
    category: 'fragrance',
    subcategory: 'Eau De Parfum',
    concern: 'Long-Lasting Fragrance',
    price: 649,
    compareAtPrice: 1499,
    discountPercent: 57,
    sku: 'TMC-WEB-3877',
    stock: 94,
    mainImage:
      'https://cdn.shopify.com/s/files/1/1188/2592/files/Titanium_50ml_1100x1100_1.jpg?v=1776420999',
    imageAlt: 'Eau De Parfum Titanium 50ml',
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/Titanium_50ml_1100x1100_1.jpg?v=1776420999',
        alt: 'Titanium 50ml EDP Bottle',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/Titanium_50ml_1100x1100_2.jpg?v=1776420999',
        alt: 'Titanium Fragrance Pyramid',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/Titanium_50ml_1100x1100_3.jpg?v=1776420999',
        alt: 'Titanium Evening Projection',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/Titanium_50ml_1100x1100_4.jpg?v=1776420999',
        alt: 'Titanium Box & Flacon',
      },
    ],
    variants: [
      {
        id: 'var_titanium_50ml',
        label: '50ml EDP Flacon',
        price: 649,
        compareAtPrice: 1499,
        sku: 'TMC-WEB-3877',
        stock: 94,
      },
    ],
    highlights: [
      'High-impact spicy woody Eau De Parfum with 10+ hour staying power',
      'Top Notes: Ruby Grapefruit, Crushed Pink Pepper & Elemi',
      'Heart Notes: Cinnamon Bark, Nutmeg & Saffron',
      'Base Notes: Rich Leather, Vetiver & Tobacco Leaf',
    ],
    ingredients:
      'Denatured Ethyl Alcohol, Fine Fragrance Oils, Aqua, BHT.',
    usageInstructions:
      'Spray generously on pulse points and collar before evening occasions.',
    ratingAvg: 4.9,
    reviewCount: 205,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: false,
    status: 'published',
    createdAt: '2025-02-06T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    id: 'prod_edp_fire',
    slug: 'eau-de-parfum-fire-50ml',
    name: 'Eau De Parfum | Fire (50ml)',
    shortDescription:
      '50ml · Clove, Cinnamon, Amber & Smoked Oud · Intense Spicy Oriental EDP',
    description:
      'Ignite your presence with Eau De Parfum Fire — a daring, fiery tribute to elemental passion. Warm Clove and Cinnamon spark the opening, unfolding into rich Amber, Patchouli, and Smoked Agarwood (Oud) for an unforgettable trail.',
    category: 'fragrance',
    subcategory: 'Eau De Parfum',
    concern: 'Long-Lasting Fragrance',
    price: 399,
    compareAtPrice: 749,
    discountPercent: 47,
    sku: 'TMC-WEB-2954',
    stock: 112,
    mainImage:
      'https://cdn.shopify.com/s/files/1/1188/2592/files/FIREEDP50ml-1.png?v=1771493899',
    imageAlt: 'Eau De Parfum Fire 50ml',
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/FIREEDP50ml-1.png?v=1771493899',
        alt: 'Fire 50ml EDP Bottle',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/FIREEDP50ml-2.png?v=1771493899',
        alt: 'Fire Spicy & Woody Accord',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/FIREEDP50ml-3.png?v=1771493899',
        alt: 'Fire EDP Intense Projection',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/FIREEDP50ml-4.png?v=1771493899',
        alt: 'Fire EDP Gift Packaging',
      },
    ],
    variants: [
      {
        id: 'var_fire_50ml',
        label: '50ml EDP Flacon',
        price: 399,
        compareAtPrice: 749,
        sku: 'TMC-WEB-2954',
        stock: 112,
      },
    ],
    highlights: [
      'Warm, magnetic spicy-amber scent profile ideal for evenings & dates',
      'Top Notes: Blood Orange, Clove Bud & Black Pepper',
      'Heart Notes: Cashmere Wood, Labdanum & Guaiac',
      'Base Notes: Golden Amber, Smoked Oud & Vanilla Bean',
    ],
    ingredients:
      'Ethyl Alcohol (95% v/v), Fragrance (Parfum), Aqua, Coumarin, Eugenol.',
    usageInstructions:
      'Mist 3–4 sprays on pulse points: wrists, neck, and inner elbows.',
    ratingAvg: 4.7,
    reviewCount: 158,
    isFeatured: false,
    isBestseller: false,
    isNewArrival: false,
    status: 'published',
    createdAt: '2025-02-08T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    id: 'prod_beard_face_wash',
    slug: 'beard-and-face-wash-rosemary-aloe',
    name: 'Beard & Face Wash | Rosemary & Aloe Vera',
    shortDescription:
      '100ml · 2-in-1 Foaming Cleanser · Softens Coarse Beard & Hydrates Facial Skin',
    description:
      'Simplify your morning routine with our 2-in-1 Beard & Face Wash infused with Rosemary and Aloe Vera. Regular soaps strip natural oils and leave facial hair wiry and itchy; this sulfate-free botanical cleanser gently removes trapped sweat, food debris, and excess sebum while conditioning both your beard and the skin beneath.',
    category: 'beard-care',
    subcategory: 'Beard Wash',
    concern: 'Patchy Beard & Softening',
    price: 212,
    compareAtPrice: 249,
    discountPercent: 15,
    sku: 'TMC-WEB-2597',
    stock: 96,
    mainImage:
      'https://cdn.shopify.com/s/files/1/1188/2592/files/Beard_and_face_Wash_Primary_1_5f67f2a0-767a-4d85-891d-ec360965d670.jpg?v=1719822193',
    imageAlt: 'Beard & Face Wash Rosemary & Aloe Vera 100ml',
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/Beard_and_face_Wash_Primary_1_5f67f2a0-767a-4d85-891d-ec360965d670.jpg?v=1719822193',
        alt: 'Beard & Face Wash Front View',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/Beard_and_face_Wash_2_88625971-2241-4a7d-9d72-ef5ef7fb0841.jpg?v=1719822193',
        alt: 'Rosemary & Aloe Vera Benefits',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/Beard_and_face_Wash_3_b5272cf9-3391-49d0-94b1-4a94889a70a0.jpg?v=1719822193',
        alt: 'Dual Beard Conditioning & Skin Cleansing',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/Beard_and_face_Wash_4_59e2b4b1-6e36-46d2-8604-9ec561c4166d.jpg?v=1719822193',
        alt: 'How to Wash Beard & Face',
      },
    ],
    variants: [
      {
        id: 'var_beardwash_100ml',
        label: '100ml Tube',
        price: 212,
        compareAtPrice: 249,
        sku: 'TMC-WEB-2597',
        stock: 96,
      },
    ],
    highlights: [
      '2-in-1 formula deep cleanses both facial skin and dense beard hair',
      'Rosemary leaf oil stimulates circulation and fights beard dandruff',
      'Pure Aloe Vera soothes redness, razor irritation, and itchiness',
      'Follow with Almond & Thyme Beard Growth Oil for best results',
    ],
    ingredients:
      'Rosmarinus Officinalis (Rosemary) Leaf Oil, Aloe Barbadensis Leaf Extract, D-Panthenol (Pro-Vitamin B5), Vegetable Glycerin, Mild Coconut Surfactants.',
    usageInstructions:
      'Work a small amount into a rich lather on wet beard and face. Massage gently into the roots and rinse clean with cool water.',
    ratingAvg: 4.7,
    reviewCount: 134,
    isFeatured: false,
    isBestseller: false,
    isNewArrival: false,
    status: 'published',
    createdAt: '2025-02-10T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    id: 'prod_hair_growth_duo',
    slug: 'hair-growth-booster-duo-derma-roller-serum',
    name: 'Hair Growth Booster Duo | Derma Roller + Hair Growth Serum',
    shortDescription:
      '540 Titanium Needles (0.5mm) Derma Roller + Redensyl & Onion Hair Growth Serum',
    description:
      'Reactivate thinning hairlines and combat hair fall with the clinical Hair Growth Booster Duo. The 0.5mm 540-Titanium Microneedle Derma Roller creates micro-channels in the scalp to boost blood circulation and collagen production, increasing the absorption of our Redensyl, Biotin, and Onion Seed Hair Growth Serum by up to 5X.',
    category: 'hair-care',
    subcategory: 'Hair Growth',
    concern: 'Hair Fall Control',
    price: 799,
    compareAtPrice: 1298,
    discountPercent: 38,
    sku: 'TMC-WEB-3960',
    stock: 64,
    mainImage:
      'https://cdn.shopify.com/s/files/1/1188/2592/files/Hair_Growth_Booster_Duo.jpg?v=1728892322',
    imageAlt: 'Hair Growth Booster Duo Derma Roller + Hair Growth Serum',
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/Hair_Growth_Booster_Duo.jpg?v=1728892322',
        alt: 'Hair Growth Booster Duo Combo Pack',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/2_ab36b700-3b30-4f7c-b39d-c170cc696114.jpg?v=1728892322',
        alt: '540 Titanium Microneedle Derma Roller',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/3_e172fb0c-1922-4ef5-8c04-a813bd9e3788.jpg?v=1728892322',
        alt: 'Hair Growth Serum Active Ingredients',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/4_0bf3a6fb-a8fd-4e64-a316-30a1e8f9e9d1.jpg?v=1728892322',
        alt: 'Step-by-Step Scalp Rolling & Serum Regimen',
      },
    ],
    variants: [
      {
        id: 'var_hair_duo',
        label: 'Derma Roller + 30ml Serum',
        price: 799,
        compareAtPrice: 1298,
        sku: 'TMC-WEB-3960',
        stock: 64,
      },
    ],
    highlights: [
      '0.5mm 540-Titanium needle Derma Roller activates dormant hair follicles',
      'Concentrated Hair Growth Serum with Redensyl, Anagain & Biotin',
      'Clinically designed to reduce hair fall and improve hair density in 90 days',
      'Ergonomic anti-slip handle with protective storage case included',
    ],
    ingredients:
      'Redensyl, Anagain, Hydrolyzed Keratin, Biotin (Vitamin B7), Onion Bulb Extract, Bhringraj Extract, Rosemary Essential Oil.',
    usageInstructions:
      'Sanitize Derma Roller with alcohol before use. Roll gently 4–5 times horizontally and vertically over thinning scalp areas twice a week, then apply Hair Growth Serum daily.',
    ratingAvg: 4.8,
    reviewCount: 221,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: false,
    status: 'published',
    createdAt: '2025-02-12T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    id: 'prod_shaving_foam_blanc',
    slug: 'blanc-shaving-foam-glycerin-vitamin-e-400g',
    name: 'Blanc Shaving Foam | Glycerin & Vitamin E (400g)',
    shortDescription:
      '400g Jumbo Can · Ultra-Rich Cushioning Lather · Prevents Razor Burn & Nicks',
    description:
      'Experience an effortlessly smooth, barbershop-grade glide every morning with the Blanc Shaving Foam. Infused with our signature Blanc fragrance, moisturizing Glycerin, Menthol, and Vitamin E, its dense micro-foam softens even the coarsest stubble while creating a protective cushion against razor burn, cuts, and post-shave tightness.',
    category: 'body-shave',
    subcategory: 'Shaving Foam',
    concern: 'Razor Burn & Dryness',
    price: 349,
    compareAtPrice: 399,
    discountPercent: 13,
    sku: 'TMC-WEB-3457',
    stock: 110,
    mainImage:
      'https://cdn.shopify.com/s/files/1/1188/2592/files/2_5026fc3a-c6ad-4b37-be0c-b7226d4f32b0.jpg?v=1698300212',
    imageAlt: 'Blanc Shaving Foam Glycerin & Vitamin E 400g',
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/2_5026fc3a-c6ad-4b37-be0c-b7226d4f32b0.jpg?v=1698300212',
        alt: 'Blanc Shaving Foam 400g Can',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/3_a27b4b8b-2d1d-4d62-8477-3954d1b64ca0.jpg?v=1698300212',
        alt: 'Rich Creamy Micro-Lather Action',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/4_0bf5905a-5d22-415a-9b3f-a791b8cf9c61.jpg?v=1698300212',
        alt: 'Glycerin & Vitamin E Skin Protection',
      },
    ],
    variants: [
      {
        id: 'var_shavefoam_400g',
        label: '400g Jumbo Can',
        price: 349,
        compareAtPrice: 399,
        sku: 'TMC-WEB-3457',
        stock: 110,
      },
    ],
    highlights: [
      'Extra-value 400g aerosol can lasts up to 180 shaves',
      'Glycerin & Coconut Acid soften coarse beard bristles rapidly',
      'Vitamin E & Aloe Vera prevent post-shave redness and dryness',
      'Infused with the iconic crisp Blanc citrus-musky scent',
    ],
    ingredients:
      'Aqua, Stearic Acid, Triethanolamine, Glycerin, Tocopheryl Acetate (Vitamin E), Aloe Barbadensis Extract, Menthol, Blanc Parfum.',
    usageInstructions:
      'Shake can well before use. Hold upright and dispense foam onto wet fingertips. Spread evenly over beard area and shave with the grain.',
    ratingAvg: 4.8,
    reviewCount: 147,
    isFeatured: false,
    isBestseller: false,
    isNewArrival: false,
    status: 'published',
    createdAt: '2025-02-15T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    id: 'prod_blanc_curation_kit',
    slug: 'blanc-curation-kit-4-piece-gift-set',
    name: 'Blanc Curation Kit | Luxury 4-Piece Grooming Gift Set',
    shortDescription:
      'Includes Blanc EDT, Blanc Body Perfume, Charcoal Face Wash & Moisturising Cream · 62% OFF',
    description:
      'The ultimate gifting statement for the modern gentleman. Presented in a signature collector gift box, the Blanc Curation Kit brings together four full-sized grooming essentials anchored by our bestselling Blanc fragrance range and deep-cleansing botanical skincare.',
    category: 'kits-combos',
    subcategory: 'Gift Box',
    concern: 'Complete Grooming Regimen',
    price: 999,
    compareAtPrice: 2646,
    discountPercent: 62,
    sku: 'TMC-WEB-3289',
    stock: 54,
    mainImage:
      'https://cdn.shopify.com/s/files/1/1188/2592/files/Blanc_Curation_Kit_24437c8c-7f6f-4584-b9f1-22f56c914ea9.jpg?v=1769668872',
    imageAlt: 'Blanc Curation Kit 4-Piece Luxury Gift Box',
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/Blanc_Curation_Kit_24437c8c-7f6f-4584-b9f1-22f56c914ea9.jpg?v=1769668872',
        alt: 'Blanc Curation Kit Open Presentation Box',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/2_e9207407-56b0-4274-96ee-96b850df4d84.jpg?v=1769668872',
        alt: 'Blanc Curation Kit Contents Detail',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/3_c35100aa-26b8-42c2-91e7-5fd890a6eb46.jpg?v=1769668872',
        alt: 'Blanc EDT & Body Spray Duo',
      },
    ],
    variants: [
      {
        id: 'var_blanc_kit',
        label: '4-Piece Gift Coffret',
        price: 999,
        compareAtPrice: 2646,
        sku: 'TMC-WEB-3289',
        stock: 54,
      },
    ],
    highlights: [
      'Save 62% compared to purchasing individual formulations',
      'Contains Blanc Eau De Toilette + Blanc No-Gas Body Perfume',
      'Includes Charcoal Face Wash + Daily Moisturising Face Cream',
      'Housed in a rigid luxury magnetic-closure gift box',
    ],
    ingredients:
      'Full-sized 4-piece curation: IFRA-certified French Perfume Oils, Activated Bamboo Charcoal, Shea Butter, Vitamin E.',
    usageInstructions:
      'Start your morning with the Charcoal Face Wash and Moisturiser, then layer the Blanc Body Perfume and Blanc EDT for 12-hour projection.',
    ratingAvg: 4.9,
    reviewCount: 274,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: false,
    status: 'published',
    createdAt: '2025-02-18T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    id: 'prod_party_starter_kit',
    slug: 'party-starter-kit-noir-perfume-gift-set',
    name: 'Party Starter Kit | Noir & Evening Grooming Gift Box',
    shortDescription:
      '4-Piece Evening Grooming & Fragrance Set · Up to 65% OFF Festive Special',
    description:
      'Turn heads at every celebration with the Party Starter Kit. Curated for evening sophistication, this 4-piece ensemble combines bold, sensual fragrances with activated charcoal cleansing and quick-absorbing skin hydration so you step out looking and smelling impeccable.',
    category: 'kits-combos',
    subcategory: 'Gift Box',
    concern: 'Complete Grooming Regimen',
    price: 899,
    compareAtPrice: 2598,
    discountPercent: 65,
    sku: 'TMC-WEB-528',
    stock: 61,
    mainImage:
      'https://cdn.shopify.com/s/files/1/1188/2592/files/Party_Starter_Kit_c83a24d7-4695-4493-9763-4b40e3f72dc8.jpg?v=1769669047',
    imageAlt: 'Party Starter Kit 4-Piece Grooming Gift Set',
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/Party_Starter_Kit_c83a24d7-4695-4493-9763-4b40e3f72dc8.jpg?v=1769669047',
        alt: 'Party Starter Kit Luxury Gift Box',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/1188/2592/files/2_e9f0dc73-9d0d-4292-bf16-1953f59de4e9.jpg?v=1769669047',
        alt: 'Party Starter Kit Fragrance Selection',
      },
    ],
    variants: [
      {
        id: 'var_party_kit',
        label: '4-Piece Evening Gift Box',
        price: 899,
        compareAtPrice: 2598,
        sku: 'TMC-WEB-528',
        stock: 61,
      },
    ],
    highlights: [
      'Unbeatable 65% savings on our bestselling evening grooming essentials',
      'Includes Signature Eau De Parfum + Intense Body Perfume',
      'Paired with Activated Charcoal Cleanser & Sheet Mask / Gel',
      'Ready-to-gift premium matte black presentation box',
    ],
    ingredients:
      'IFRA-Certified Fragrance Oils, Activated Bamboo Charcoal, Niacinamide, Aloe Vera, Vitamin E.',
    usageInstructions:
      'Prep skin with the Charcoal cleanser 30 minutes before heading out, then apply the Eau De Parfum on pulse points.',
    ratingAvg: 4.9,
    reviewCount: 188,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: true,
    status: 'published',
    createdAt: '2025-02-20T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coupon_royal15',
    code: 'ROYAL15',
    description: 'Flat 15% OFF on orders above ₹999 (Maximum discount ₹500)',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 999,
    maxDiscountAmount: 500,
    active: true,
    expiresAt: '2027-12-31T23:59:59.000Z',
  },
  {
    id: 'coupon_first200',
    code: 'GENTLEMAN200',
    description: 'Flat ₹200 OFF on luxury grooming orders above ₹1,499',
    discountType: 'fixed',
    discountValue: 200,
    minOrderAmount: 1499,
    active: true,
    expiresAt: '2027-12-31T23:59:59.000Z',
  },
  {
    id: 'coupon_perfume10',
    code: 'PERFUME10',
    description: 'Instant 10% OFF on any Eau De Parfum or Gift Kit above ₹599',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 599,
    maxDiscountAmount: 350,
    active: true,
    expiresAt: '2027-12-31T23:59:59.000Z',
  },
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_001',
    productId: 'prod_edp_black',
    uid: 'verified_buyer_1',
    authorName: 'Vikramaditya Rathore · Mumbai',
    rating: 5,
    title: 'Incredible projection and compliment magnet',
    comment:
      'Eau De Parfum Black easily lasts 9+ hours in Mumbai humidity. The opening lemon and mint notes feel crisp and executive, and the sandalwood dry-down is pure luxury.',
    verifiedPurchase: true,
    createdAt: '2025-03-10T14:20:00.000Z',
  },
  {
    id: 'rev_002',
    productId: 'prod_charcoal_fw',
    uid: 'verified_buyer_2',
    authorName: 'Rohan Kulkarni · Bengaluru',
    rating: 5,
    title: 'Best charcoal face wash for oily skin & daily commute',
    comment:
      'After riding through Bengaluru traffic, one wash with the Charcoal & Niacinamide Face Wash removes all grime and oiliness without making my face feel stretched.',
    verifiedPurchase: true,
    createdAt: '2025-03-14T09:15:00.000Z',
  },
  {
    id: 'rev_003',
    productId: 'prod_beard_oil_almond',
    uid: 'verified_buyer_3',
    authorName: 'Kabir Malhotra · New Delhi',
    rating: 5,
    title: 'Softened my coarse beard in a week',
    comment:
      'The Almond & Thyme Beard Growth Oil is completely non-sticky and smells subtle and earthy. My patchy cheek line looks noticeably fuller after 5 weeks.',
    verifiedPurchase: true,
    createdAt: '2025-03-19T18:40:00.000Z',
  },
  {
    id: 'rev_004',
    productId: 'prod_blanc_curation_kit',
    uid: 'verified_buyer_4',
    authorName: 'Siddharth Nair · Hyderabad',
    rating: 5,
    title: 'Gifted the Blanc Curation Kit to my brother — 10/10 packaging',
    comment:
      'At ₹999 for 4 full-size products including Blanc EDT, this gift box is unbeatable value. Looks and feels like an international luxury coffret.',
    verifiedPurchase: true,
    createdAt: '2025-04-02T11:30:00.000Z',
  },
];
