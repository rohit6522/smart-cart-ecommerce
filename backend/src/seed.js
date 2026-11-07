const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Product = require("./models/Product");
const Category = require("./models/Category");
const User = require("./models/User");
const Coupon = require("./models/Coupon");

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Cutting-edge smartphones, wireless audio, laptops, and smart wearables.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    icon: "Headphones",
    displayOrder: 1,
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Trendsetting apparel, casual wear, outerwear, and designer aesthetics.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80",
    icon: "Shirt",
    displayOrder: 2,
  },
  {
    name: "Footwear",
    slug: "footwear",
    description: "Athletic sneakers, formal leather shoes, and cushioned runners.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    icon: "Footprints",
    displayOrder: 3,
  },
  {
    name: "Watches",
    slug: "watches",
    description: "Chronographs, minimalist timepieces, and connected smartwatches.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    icon: "Watch",
    displayOrder: 4,
  },
  {
    name: "Bags",
    slug: "bags",
    description: "Waterproof commuter backpacks, leather duffels, and travel totes.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    icon: "Briefcase",
    displayOrder: 5,
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Modern cookware, aesthetic coffee gear, and ambient home styling.",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
    icon: "Home",
    displayOrder: 6,
  },
  {
    name: "Beauty",
    slug: "beauty",
    description: "Organic skincare, luxury fragrances, and revitalizing wellness kits.",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80",
    icon: "Sparkles",
    displayOrder: 7,
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Polarized eyewear, genuine leather belts, and tech lifestyle essentials.",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80",
    icon: "Glasses",
    displayOrder: 8,
  },
];

const products = [
  {
    id: 1,
    name: "Smart Studio Pro Wireless ANC Headphones",
    slug: "smart-studio-pro-wireless-anc-headphones",
    brand: "SoundWave",
    category: "Electronics",
    description: "Flagship wireless over-ear headphones featuring 40mm custom beryllium drivers, adaptive active noise cancellation, transparency mode, and up to 45 hours of ultra-long battery life with rapid USB-C charging.",
    price: 14999,
    discountPercentage: 20,
    discountedPrice: 11999,
    stockQuantity: 45,
    stock: 45,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80", isPrimary: true },
    ],
    averageRating: 4.8,
    rating: 4.8,
    totalReviews: 128,
    numReviews: 128,
    isFeatured: true,
    isActive: true,
    variants: [
      { id: 101, variantType: "Color", variantValue: "Space Black", stockQuantity: 20, sku: "SND-ANC-BLK" },
      { id: 102, variantType: "Color", variantValue: "Silver Birch", stockQuantity: 15, sku: "SND-ANC-SLV" },
      { id: 103, variantType: "Color", variantValue: "Midnight Navy", stockQuantity: 10, sku: "SND-ANC-NVY" },
    ],
    specifications: {
      "Battery Life": "45 Hours (ANC On)",
      "Connectivity": "Bluetooth 5.3 + 3.5mm Aux",
      "Driver Size": "40mm Beryllium",
      "Weight": "250g",
    },
    tags: ["audio", "headphones", "anc", "wireless", "electronics"],
  },
  {
    id: 2,
    name: "Apex Ultra Minimalist Smartwatch 44mm",
    slug: "apex-ultra-minimalist-smartwatch-44mm",
    brand: "Chronos",
    category: "Watches",
    description: "Sleek aerospace-grade aluminum casing with an always-on 1.78-inch Super AMOLED retina display. Advanced health tracking including ECG, continuous SpO2, heart rate, and 50m water resistance.",
    price: 19999,
    discountPercentage: 15,
    discountedPrice: 16999,
    stockQuantity: 30,
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80", isPrimary: true },
    ],
    averageRating: 4.9,
    rating: 4.9,
    totalReviews: 94,
    numReviews: 94,
    isFeatured: true,
    isActive: true,
    variants: [
      { id: 201, variantType: "Strap", variantValue: "Milanese Loop", stockQuantity: 12, sku: "CHR-WTC-MIL" },
      { id: 202, variantType: "Strap", variantValue: "Silicone Sport", stockQuantity: 18, sku: "CHR-WTC-SPT" },
    ],
    specifications: {
      "Display": "1.78\" AMOLED, 448x368",
      "Water Resistance": "50m (5 ATM)",
      "Battery Life": "7 Days Typical",
      "Sensors": "Optical HR, SpO2, ECG, Accelerometer",
    },
    tags: ["smartwatch", "fitness", "wearables", "watches"],
  },
  {
    id: 3,
    name: "AeroGlide Ultralight Running Sneakers",
    slug: "aeroglide-ultralight-running-sneakers",
    brand: "SpeedKnit",
    category: "Footwear",
    description: "Engineered breathable mesh upper with responsive dual-density nitrogen-infused foam cushioning. Delivers maximum energy return, ergonomic arch support, and durable rubber traction.",
    price: 6499,
    discountPercentage: 25,
    discountedPrice: 4874,
    stockQuantity: 60,
    stock: 60,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80", isPrimary: true },
    ],
    averageRating: 4.7,
    rating: 4.7,
    totalReviews: 215,
    numReviews: 215,
    isFeatured: true,
    isActive: true,
    variants: [
      { id: 301, variantType: "Size", variantValue: "UK 7 / US 8", stockQuantity: 15, sku: "SPK-RN-07" },
      { id: 302, variantType: "Size", variantValue: "UK 8 / US 9", stockQuantity: 20, sku: "SPK-RN-08" },
      { id: 303, variantType: "Size", variantValue: "UK 9 / US 10", stockQuantity: 15, sku: "SPK-RN-09" },
      { id: 304, variantType: "Size", variantValue: "UK 10 / US 11", stockQuantity: 10, sku: "SPK-RN-10" },
    ],
    specifications: {
      "Midsole": "Nitrogen-infused EVA Foam",
      "Upper": "Engineered Jacquard Knit",
      "Heel Drop": "8mm",
      "Weight": "218g per shoe",
    },
    tags: ["shoes", "sneakers", "running", "footwear", "sports"],
  },
  {
    id: 4,
    name: "Nomad Water-Resistant Commuter Backpack 28L",
    slug: "nomad-water-resistant-commuter-backpack-28l",
    brand: "Vanguard",
    category: "Bags",
    description: "Crafted from recycled 900D ballistic nylon with weather-sealed YKK zippers. Dedicated padded 16-inch laptop compartment, hidden RFID passport pocket, and luggage pass-through strap.",
    price: 4999,
    discountPercentage: 10,
    discountedPrice: 4499,
    stockQuantity: 35,
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80", isPrimary: true },
    ],
    averageRating: 4.8,
    rating: 4.8,
    totalReviews: 76,
    numReviews: 76,
    isFeatured: true,
    isActive: true,
    variants: [
      { id: 401, variantType: "Color", variantValue: "Matte Charcoal", stockQuantity: 20, sku: "VNG-BK-CHR" },
      { id: 402, variantType: "Color", variantValue: "Olive Drab", stockQuantity: 15, sku: "VNG-BK-OLV" },
    ],
    specifications: {
      "Capacity": "28 Liters",
      "Laptop Fit": "Up to 16-inch MacBook Pro",
      "Material": "900D Recycled Ballistic Nylon",
      "Dimensions": "48 x 32 x 18 cm",
    },
    tags: ["backpack", "travel", "laptop", "bags"],
  },
  {
    id: 5,
    name: "Classic Tailored Oxford Cotton Shirt",
    slug: "classic-tailored-oxford-cotton-shirt",
    brand: "Aura Heritage",
    category: "Fashion",
    description: "100% long-staple Egyptian cotton woven in a classic Oxford weave. Pre-shrunk, breathable, with mother-of-pearl buttons and tailored modern fit suitable for both business and leisure.",
    price: 2999,
    discountPercentage: 20,
    discountedPrice: 2399,
    stockQuantity: 50,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80", isPrimary: true },
    ],
    averageRating: 4.6,
    rating: 4.6,
    totalReviews: 88,
    numReviews: 88,
    isFeatured: false,
    isActive: true,
    variants: [
      { id: 501, variantType: "Size", variantValue: "S", stockQuantity: 10, sku: "AUR-SH-S" },
      { id: 502, variantType: "Size", variantValue: "M", stockQuantity: 20, sku: "AUR-SH-M" },
      { id: 503, variantType: "Size", variantValue: "L", stockQuantity: 15, sku: "AUR-SH-L" },
      { id: 504, variantType: "Size", variantValue: "XL", stockQuantity: 5, sku: "AUR-SH-XL" },
    ],
    specifications: {
      "Fabric": "100% Egyptian Cotton",
      "Fit": "Tailored Slim Fit",
      "Care": "Machine wash cold, warm iron",
    },
    tags: ["fashion", "shirt", "cotton", "menswear"],
  },
  {
    id: 6,
    name: "Barista Touch Precision Espresso Machine",
    slug: "barista-touch-precision-espresso-machine",
    brand: "KaffeHaus",
    category: "Home & Kitchen",
    description: "Commercial-grade 15-bar Italian pump with digital PID temperature control and 3-second ThermoJet heating. Features automatic micro-foam steam wand for café-quality latte art.",
    price: 38999,
    discountPercentage: 12,
    discountedPrice: 34319,
    stockQuantity: 18,
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80", isPrimary: true },
    ],
    averageRating: 4.9,
    rating: 4.9,
    totalReviews: 64,
    numReviews: 64,
    isFeatured: true,
    isActive: true,
    variants: [
      { id: 601, variantType: "Finish", variantValue: "Brushed Stainless Steel", stockQuantity: 10, sku: "KFH-ESP-SS" },
      { id: 602, variantType: "Finish", variantValue: "Truffle Black", stockQuantity: 8, sku: "KFH-ESP-BLK" },
    ],
    specifications: {
      "Pump Pressure": "15 Bar Italian Pump",
      "Water Tank": "2.0 Liters",
      "Heating System": "ThermoJet 3-Second Heat",
      "Power": "1680W",
    },
    tags: ["coffee", "espresso", "appliances", "kitchen"],
  },
  {
    id: 7,
    name: "Pure Radiance Vitamin C + Hyaluronic Facial Serum",
    slug: "pure-radiance-vitamin-c-facial-serum",
    brand: "DermaBotanics",
    category: "Beauty",
    description: "Clinical strength 15% pure L-Ascorbic Acid formulated with Ferulic Acid and multi-weight Hyaluronic Acid. Brightens hyperpigmentation, stimulates collagen, and shields against free radicals.",
    price: 1899,
    discountPercentage: 20,
    discountedPrice: 1519,
    stockQuantity: 90,
    stock: 90,
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80", isPrimary: true },
    ],
    averageRating: 4.7,
    rating: 4.7,
    totalReviews: 182,
    numReviews: 182,
    isFeatured: false,
    isActive: true,
    variants: [
      { id: 701, variantType: "Size", variantValue: "30ml Bottle", stockQuantity: 50, sku: "DRM-SRM-30" },
      { id: 702, variantType: "Size", variantValue: "60ml Value Size", stockQuantity: 40, sku: "DRM-SRM-60" },
    ],
    specifications: {
      "Volume": "30ml / 60ml",
      "Active Ingredients": "15% L-Ascorbic Acid, 0.5% Ferulic Acid, 1% Vitamin E",
      "Skin Type": "All Skin Types (Dermatologist Tested)",
    },
    tags: ["skincare", "beauty", "serum", "clean-beauty"],
  },
  {
    id: 8,
    name: "Aviator Titanium Polarized Sunglasses",
    slug: "aviator-titanium-polarized-sunglasses",
    brand: "Optika",
    category: "Accessories",
    description: "Featherweight Japanese beta-titanium wire frame weighing only 18 grams. Fitted with 9-layer anti-reflective polarized lenses with 100% UVA/UVB UV400 full-spectrum protection.",
    price: 4999,
    discountPercentage: 30,
    discountedPrice: 3499,
    stockQuantity: 40,
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80", isPrimary: true },
    ],
    averageRating: 4.8,
    rating: 4.8,
    totalReviews: 55,
    numReviews: 55,
    isFeatured: true,
    isActive: true,
    variants: [
      { id: 801, variantType: "Frame Color", variantValue: "Champagne Gold", stockQuantity: 20, sku: "OPT-AV-GLD" },
      { id: 802, variantType: "Frame Color", variantValue: "Gunmetal Smoke", stockQuantity: 20, sku: "OPT-AV-GUN" },
    ],
    specifications: {
      "Frame Material": "Japanese Beta-Titanium",
      "Lens": "9-Layer Polarized CR-39",
      "UV Rating": "UV400 (100% UVA/B)",
      "Weight": "18.4g",
    },
    tags: ["sunglasses", "accessories", "polarized", "eyewear"],
  },
  {
    id: 9,
    name: "TrueSound Pro Noise-Cancelling Earbuds",
    slug: "truesound-pro-noise-cancelling-earbuds",
    brand: "SoundWave",
    category: "Electronics",
    description: "Compact wireless earbuds featuring dual hybrid ANC microphones, spatial audio tracking, IPX7 water and sweat proofing, and wireless charging case delivering 36 hours total playback.",
    price: 7999,
    discountPercentage: 25,
    discountedPrice: 5999,
    stockQuantity: 70,
    stock: 70,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80", isPrimary: true },
    ],
    averageRating: 4.7,
    rating: 4.7,
    totalReviews: 140,
    numReviews: 140,
    isFeatured: false,
    isActive: true,
    variants: [
      { id: 901, variantType: "Color", variantValue: "Pearl White", stockQuantity: 40, sku: "SND-EAR-WHT" },
      { id: 902, variantType: "Color", variantValue: "Matte Black", stockQuantity: 30, sku: "SND-EAR-BLK" },
    ],
    specifications: {
      "Battery": "8 Hours (36h with case)",
      "Charging": "Qi Wireless + USB-C Quick Charge",
      "Waterproofing": "IPX7",
      "Drivers": "11mm Dynamic Bass Drivers",
    },
    tags: ["earbuds", "audio", "wireless", "electronics"],
  },
  {
    id: 10,
    name: "Heritage Full-Grain Leather Bi-Fold Wallet",
    slug: "heritage-full-grain-leather-bi-fold-wallet",
    brand: "Artisan Co.",
    category: "Accessories",
    description: "Handcrafted from vegetable-tanned Italian full-grain leather that patinas beautifully with age. Features 8 card slots, dual cash compartments, and integrated RFID-blocking lining.",
    price: 2499,
    discountPercentage: 20,
    discountedPrice: 1999,
    stockQuantity: 45,
    stock: 45,
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80", isPrimary: true },
    ],
    averageRating: 4.9,
    rating: 4.9,
    totalReviews: 87,
    numReviews: 87,
    isFeatured: false,
    isActive: true,
    variants: [
      { id: 1001, variantType: "Leather Shade", variantValue: "Cognac Brown", stockQuantity: 25, sku: "ART-WLT-CGN" },
      { id: 1002, variantType: "Leather Shade", variantValue: "Espresso Black", stockQuantity: 20, sku: "ART-WLT-ESP" },
    ],
    specifications: {
      "Material": "100% Vegetable-Tanned Italian Leather",
      "Security": "Full RFID Shielding Layer",
      "Capacity": "8 Cards + 2 Currency Slots",
    },
    tags: ["wallet", "leather", "accessories", "gifts"],
  },
  {
    id: 11,
    name: "ErgoFlow High-Back Ergonomic Office Chair",
    slug: "ergoflow-high-back-ergonomic-office-chair",
    brand: "ComfortPlus",
    category: "Home & Kitchen",
    description: "Engineered for 12+ hour sitting sessions with dynamic lumbar support, breathable German mesh backrest, 4D adjustable armrests, and 135-degree synchro-tilt reclining lock mechanism.",
    price: 18499,
    discountPercentage: 15,
    discountedPrice: 15724,
    stockQuantity: 22,
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1580481077195-c3a9927b74b7?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1580481077195-c3a9927b74b7?w=800&auto=format&fit=crop&q=80", isPrimary: true },
    ],
    averageRating: 4.8,
    rating: 4.8,
    totalReviews: 112,
    numReviews: 112,
    isFeatured: true,
    isActive: true,
    variants: [
      { id: 1101, variantType: "Color", variantValue: "Graphite Mesh", stockQuantity: 12, sku: "ERG-CHR-GRP" },
      { id: 1102, variantType: "Color", variantValue: "Lunar Gray Mesh", stockQuantity: 10, sku: "ERG-CHR-LNR" },
    ],
    specifications: {
      "Max Capacity": "150 kg",
      "Gas Lift": "Class 4 Heavy Duty Cylinder",
      "Base": "Cast Aluminum 5-Star Base with PU Casters",
    },
    tags: ["furniture", "chair", "ergonomic", "office", "home-kitchen"],
  },
  {
    id: 12,
    name: "Classic Chronograph Stainless Steel Watch",
    slug: "classic-chronograph-stainless-steel-watch",
    brand: "Veloce Geneva",
    category: "Watches",
    description: "Surgical-grade 316L stainless steel case paired with scratch-resistant sapphire crystal glass. Japanese Seiko meca-quartz movement with stopwatch subdials and date window.",
    price: 12999,
    discountPercentage: 25,
    discountedPrice: 9749,
    stockQuantity: 28,
    stock: 28,
    imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80", isPrimary: true },
    ],
    averageRating: 4.9,
    rating: 4.9,
    totalReviews: 145,
    numReviews: 145,
    isFeatured: false,
    isActive: true,
    variants: [
      { id: 1201, variantType: "Dial", variantValue: "Sunburst Blue", stockQuantity: 15, sku: "VEL-CHR-BLU" },
      { id: 1202, variantType: "Dial", variantValue: "Panda White/Black", stockQuantity: 13, sku: "VEL-CHR-PND" },
    ],
    specifications: {
      "Case Diameter": "41mm",
      "Crystal": "Sapphire with Anti-Reflective Coating",
      "Movement": "Japanese VK64 Meca-Quartz Chronograph",
      "Water Resistance": "100 Meters / 10 ATM",
    },
    tags: ["watches", "chronograph", "luxury", "menswear"],
  },
];

const coupons = [
  {
    id: 1,
    code: "WELCOME1000",
    description: "Get ₹1,000 off on your first order above ₹3,000",
    discountType: "fixed",
    discountValue: 1000,
    discountAmount: 1000,
    minOrderValue: 3000,
    maxDiscountAmount: 1000,
    isActive: true,
  },
  {
    id: 2,
    code: "SAVE20",
    description: "20% instant discount on orders above ₹1,999 (up to ₹1,500)",
    discountType: "percentage",
    discountValue: 20,
    discountAmount: 0,
    minOrderValue: 1999,
    maxDiscountAmount: 1500,
    isActive: true,
  },
  {
    id: 3,
    code: "SMART500",
    description: "Flat ₹500 discount on orders above ₹1,500",
    discountType: "fixed",
    discountValue: 500,
    discountAmount: 500,
    minOrderValue: 1500,
    maxDiscountAmount: 500,
    isActive: true,
  },
];

const demoUsers = [
  {
    userId: 1,
    name: "Rohit Raj",
    email: "rohitrajyadav6522@gmail.com",
    rawPassword: "Password@123",
    role: "USER",
    phone: "+91 9876543210",
    referralCode: "SMART6522",
    addresses: [
      {
        id: 1,
        label: "Home",
        fullName: "Rohit Raj",
        phone: "+91 9876543210",
        street: "B-402, Green Avenue, MG Road",
        city: "Bengaluru",
        state: "Karnataka",
        zip: "560001",
        isDefault: true,
      },
    ],
  },
  {
    userId: 2,
    name: "Rohit Raj (Alternate)",
    email: "rohitraj6522@gmail.com",
    rawPassword: "Password@123",
    role: "USER",
    phone: "+91 9876543210",
    referralCode: "SMART6523",
    addresses: [],
  },
  {
    userId: 3,
    name: "Express Delivery Agent",
    email: "delivery@smartcart.com",
    rawPassword: "Delivery@123",
    role: "DELIVERY_BOY",
    phone: "+91 9876543211",
    referralCode: "DELIVERY01",
    addresses: [],
  },
  {
    userId: 4,
    name: "Admin Rohit",
    email: "admin@smartcart.com",
    rawPassword: "Admin@123",
    role: "ADMIN",
    phone: "+91 9876543212",
    referralCode: "ADMIN001",
    addresses: [],
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in backend/.env!");
    process.exit(1);
  }

  console.log("Connecting to MongoDB Atlas at:", uri.replace(/:([^:@]+)@/, ":****@"));
  await mongoose.connect(uri);
  console.log("Connected to database:", mongoose.connection.name);

  // Clear existing
  console.log("Clearing existing collections...");
  await Promise.all([
    Product.deleteMany({}),
    Category.deleteMany({}),
    Coupon.deleteMany({}),
    User.deleteMany({}),
  ]);

  // Insert categories
  console.log(`Inserting ${categories.length} categories...`);
  await Category.insertMany(categories);

  // Insert products
  console.log(`Inserting ${products.length} products...`);
  await Product.insertMany(products);

  // Insert coupons
  console.log(`Inserting ${coupons.length} coupons...`);
  await Coupon.insertMany(coupons);

  // Hash and insert users
  console.log(`Inserting ${demoUsers.length} demo users (USER, DELIVERY_BOY, ADMIN)...`);
  const salt = await bcrypt.genSalt(10);
  const preparedUsers = await Promise.all(
    demoUsers.map(async (u) => {
      const hashedPassword = await bcrypt.hash(u.rawPassword, salt);
      return {
        userId: u.userId,
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        phone: u.phone,
        referralCode: u.referralCode,
        addresses: u.addresses,
        isActive: true,
      };
    })
  );
  await User.insertMany(preparedUsers);

  console.log("==========================================");
  console.log("SUCCESS! Database seeded successfully into MongoDB Atlas!");
  console.log(`Total Products seeded: ${products.length}`);
  console.log(`Total Categories seeded: ${categories.length}`);
  console.log(`Total Coupons seeded: ${coupons.length}`);
  console.log(`Total Users seeded: ${demoUsers.length}`);
  console.log("==========================================");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
