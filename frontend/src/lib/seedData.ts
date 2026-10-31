import bcrypt from "bcryptjs";
import connectToDatabase from "./mongodb";
import User from "@/models/User";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import Review from "@/models/Review";

export const initialCategories = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Cutting-edge smartphones, wireless audio, laptops, and smart wearables.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&auto=format&fit=crop&q=80",
    icon: "Headphones",
    displayOrder: 1,
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Trendsetting apparel, casual wear, outerwear, and designer aesthetics.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80",
    icon: "Shirt",
    displayOrder: 2,
  },
  {
    name: "Shoes",
    slug: "shoes",
    description: "Athletic sneakers, formal leather shoes, and cushioned runners.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&auto=format&fit=crop&q=80",
    icon: "Footprints",
    displayOrder: 3,
  },
  {
    name: "Watches",
    slug: "watches",
    description: "Chronographs, minimalist timepieces, and connected smartwatches.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1600&auto=format&fit=crop&q=80",
    icon: "Watch",
    displayOrder: 4,
  },
  {
    name: "Bags",
    slug: "bags",
    description: "Waterproof commuter backpacks, leather duffels, and travel totes.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1600&auto=format&fit=crop&q=80",
    icon: "Briefcase",
    displayOrder: 5,
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Modern cookware, aesthetic coffee gear, and ambient home styling.",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1616486338812-3dADAe4b4ace?w=1600&auto=format&fit=crop&q=80",
    icon: "Home",
    displayOrder: 6,
  },
  {
    name: "Beauty",
    slug: "beauty",
    description: "Organic skincare, luxury fragrances, and revitalizing wellness kits.",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&auto=format&fit=crop&q=80",
    icon: "Sparkles",
    displayOrder: 7,
  },
  {
    name: "Books",
    slug: "books",
    description: "Best-selling fiction, tech architecture, business, and mindfulness.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&auto=format&fit=crop&q=80",
    icon: "BookOpen",
    displayOrder: 8,
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Polarized eyewear, genuine leather belts, and tech lifestyle essentials.",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1600&auto=format&fit=crop&q=80",
    icon: "Glasses",
    displayOrder: 9,
  },
];

export async function seedDatabase() {
  await connectToDatabase();

  // 1. Seed Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("Admin@123456", salt);
  const customerPassword = await bcrypt.hash("Customer@123456", salt);
  const deliveryPassword = await bcrypt.hash("Delivery@123456", salt);

  await User.deleteMany({});
  const admin = await User.create({
    name: "CartNova Admin",
    email: "admin@cartnova.com",
    password: adminPassword,
    role: "admin",
    phone: "+91 9876543210",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    addresses: [
      {
        fullName: "CartNova Admin",
        phone: "+91 9876543210",
        street: "Cyber Towers, Hitech City",
        city: "Hyderabad",
        state: "Telangana",
        postalCode: "500081",
        country: "India",
        isDefault: true,
        label: "Work",
      },
    ],
  });

  const customer = await User.create({
    name: "Rahul Sharma",
    email: "customer@cartnova.com",
    password: customerPassword,
    role: "customer",
    phone: "+91 9898989898",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    budgetLimit: 25000,
    referralCode: "TROSTO-RAHUL",
    addresses: [
      {
        fullName: "Rahul Sharma",
        phone: "+91 9898989898",
        street: "Flat 402, Green Glen Layout, Bellandur",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560103",
        country: "India",
        isDefault: true,
        label: "Home",
      },
      {
        fullName: "Rahul Sharma",
        phone: "+91 9898989898",
        street: "Tech Park Block B, Outer Ring Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560103",
        country: "India",
        isDefault: false,
        label: "Work",
      },
    ],
  });

  await User.create({
    name: "Vikram Singh (Rider)",
    email: "delivery@cartnova.com",
    password: deliveryPassword,
    role: "delivery",
    phone: "+91 9777777777",
  });

  // 2. Seed Categories
  await Category.deleteMany({});
  const createdCategories: Record<string, any> = {};
  for (const cat of initialCategories) {
    const doc = await Category.create(cat);
    createdCategories[cat.slug] = doc;
  }

  // 3. Seed Products
  await Product.deleteMany({});
  const productsToSeed = [
    {
      name: "Trosto SoundPro Active Noise Cancelling Headphones",
      slug: "trosto-soundpro-anc-headphones",
      brand: "Trosto Audio",
      category: createdCategories["electronics"]._id,
      description:
        "Experience studio-mastered clarity with 40mm beryllium drivers, 45dB hybrid ANC, transparency mode, and ultra-comfortable memory foam earpads. Offers up to 60 hours of wireless playback on a single quick charge.",
      shortDescription: "Premium wireless ANC headphones with 60-hour battery and Hi-Res LDAC audio.",
      price: 12999,
      compareAtPrice: 19999,
      stock: 45,
      sku: "ELC-SND-001",
      images: [
        {
          url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80",
          altText: "Trosto SoundPro ANC Headphones Main View",
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1000&auto=format&fit=crop&q=80",
          altText: "Trosto SoundPro ANC Headphones Angle View",
        },
        {
          url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1000&auto=format&fit=crop&q=80",
          altText: "Trosto SoundPro Folded Case",
        },
      ],
      variants: [
        { sku: "ELC-SND-001-BLK", color: "Matte Black", colorCode: "#171717", stock: 25 },
        { sku: "ELC-SND-001-SLV", color: "Lunar Silver", colorCode: "#E2E8F0", stock: 20 },
      ],
      specifications: {
        Driver: "40mm Custom Beryllium",
        BatteryLife: "60 Hours (ANC Off) / 45 Hours (ANC On)",
        Bluetooth: "5.3 with multipoint pairing",
        Weight: "250g",
        Warranty: "2 Years Replacement",
      },
      rating: 4.8,
      numReviews: 128,
      isFeatured: true,
      tags: ["headphones", "audio", "anc", "bluetooth", "bestseller"],
    },
    {
      name: "Trosto Horizon Ultra Smartwatch 2.0",
      slug: "trosto-horizon-ultra-smartwatch",
      brand: "Trosto Tech",
      category: createdCategories["watches"]._id,
      description:
        "Engineered with aerospace-grade titanium, a 1.96-inch sapphire AMOLED display, precision dual-frequency GPS, heart-rate variability, and SpO2 sensors. 10 ATM water resistance.",
      shortDescription: "Aerospace titanium smartwatch with dual-band GPS and sapphire crystal display.",
      price: 15499,
      compareAtPrice: 24999,
      stock: 30,
      sku: "WTC-HRZ-002",
      images: [
        {
          url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80",
          altText: "Trosto Horizon Ultra Smartwatch Front",
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1000&auto=format&fit=crop&q=80",
          altText: "Trosto Horizon Wrist View",
        },
      ],
      variants: [
        { sku: "WTC-HRZ-002-ORG", color: "Sunset Orange", colorCode: "#F97316", size: "46mm", stock: 15 },
        { sku: "WTC-HRZ-002-BLK", color: "Midnight Titanium", colorCode: "#0F172A", size: "46mm", stock: 15 },
      ],
      specifications: {
        Display: "1.96-inch Always-on AMOLED 1000 nits",
        WaterResistance: "10 ATM (100 meters)",
        Battery: "Up to 14 days normal use",
        Sensors: "ECG, SpO2, Optical Heart Rate, Altimeter",
      },
      rating: 4.9,
      numReviews: 94,
      isFeatured: true,
      tags: ["smartwatch", "fitness", "gps", "titanium"],
    },
    {
      name: "Trosto Velocity Carbon Running Shoes",
      slug: "trosto-velocity-carbon-running-shoes",
      brand: "Trosto Athletic",
      category: createdCategories["shoes"]._id,
      description:
        "Supercritical nitrogen-infused foam coupled with a full-length curved carbon fiber propulsion plate. Engineered breathable jacquard mesh upper provides lockdown comfort for marathons and fast road miles.",
      shortDescription: "Carbon-plated marathon racing shoes with nitrogen foam bounce.",
      price: 8499,
      compareAtPrice: 12999,
      stock: 50,
      sku: "SHS-VEL-003",
      images: [
        {
          url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80",
          altText: "Trosto Velocity Crimson Runner",
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1000&auto=format&fit=crop&q=80",
          altText: "Trosto Velocity Sole and Grip",
        },
      ],
      variants: [
        { sku: "SHS-VEL-003-8", size: "UK 8", color: "Racing Red / Orange", stock: 12 },
        { sku: "SHS-VEL-003-9", size: "UK 9", color: "Racing Red / Orange", stock: 18 },
        { sku: "SHS-VEL-003-10", size: "UK 10", color: "Racing Red / Orange", stock: 20 },
      ],
      specifications: {
        Weight: "215g (UK 9)",
        Drop: "8mm",
        Plate: "Full Carbon Fiber Spoon Plate",
        Sole: "Continental Continental High-Abrasion Rubber",
      },
      rating: 4.7,
      numReviews: 67,
      isFeatured: true,
      tags: ["shoes", "running", "carbon", "athletics"],
    },
    {
      name: "Trosto Executive Oxford Slim Briefcase & Commuter Bag",
      slug: "trosto-executive-oxford-commuter-bag",
      brand: "Trosto Leather Co.",
      category: createdCategories["bags"]._id,
      description:
        "Handcrafted from full-grain vegetable-tanned Italian leather with Japanese YKK Excella zippers. Features padded compartments for a 16-inch MacBook Pro, iPad Pro, passport sleeve, and luggage pass-through strap.",
      shortDescription: "Full-grain Italian leather commuter briefcase with 16-inch laptop pocket.",
      price: 9999,
      compareAtPrice: 14999,
      stock: 22,
      sku: "BAG-EXE-004",
      images: [
        {
          url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&auto=format&fit=crop&q=80",
          altText: "Trosto Executive Briefcase in Heritage Tan",
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop&q=80",
          altText: "Trosto Leather Texture Detail",
        },
      ],
      variants: [
        { sku: "BAG-EXE-004-TAN", color: "Heritage Cognac Tan", colorCode: "#854D0E", stock: 12 },
        { sku: "BAG-EXE-004-BLK", color: "Obsidian Black", colorCode: "#0F172A", stock: 10 },
      ],
      specifications: {
        Material: "100% Full-grain Vegetable Tanned Cowhide",
        Dimensions: "40cm x 30cm x 9cm",
        LaptopCompatibility: "Up to 16.2 inch laptops",
        Hardware: "Antiqued Brass / Brushed Steel",
      },
      rating: 4.9,
      numReviews: 42,
      isFeatured: true,
      tags: ["bags", "briefcase", "leather", "luxury"],
    },
    {
      name: "Trosto Minimalist Heavyweight Merino Wool Overshirt",
      slug: "trosto-merino-wool-overshirt",
      brand: "Trosto Apparel",
      category: createdCategories["fashion"]._id,
      description:
        "Crafted from 100% Australian 340gsm Merino wool woven for thermal regulation, natural wrinkle resistance, and softness. Cut with modern drop-shoulders and horn buttons.",
      shortDescription: "Tailored 340gsm pure merino wool overshirt for effortless layering.",
      price: 5499,
      compareAtPrice: 8999,
      stock: 60,
      sku: "FSH-SHR-005",
      images: [
        {
          url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1000&auto=format&fit=crop&q=80",
          altText: "Trosto Merino Wool Overshirt Model Front",
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1000&auto=format&fit=crop&q=80",
          altText: "Trosto Shirt Weave Close Up",
        },
      ],
      variants: [
        { sku: "FSH-SHR-005-M", size: "M", color: "Dark Charcoal", stock: 20 },
        { sku: "FSH-SHR-005-L", size: "L", color: "Dark Charcoal", stock: 25 },
        { sku: "FSH-SHR-005-XL", size: "XL", color: "Dark Charcoal", stock: 15 },
      ],
      specifications: {
        Fabric: "100% Australian Merino Wool (340 GSM)",
        Fit: "Relaxed Boxy Fit",
        Care: "Dry clean or gentle cold wool cycle",
      },
      rating: 4.6,
      numReviews: 53,
      isFeatured: false,
      tags: ["fashion", "wool", "shirt", "minimal"],
    },
    {
      name: "Trosto Artisan Precision Pour-Over Coffee Station",
      slug: "trosto-artisan-pourover-coffee-station",
      brand: "Trosto Home",
      category: createdCategories["home-kitchen"]._id,
      description:
        "Precision brass dripper stand, borosilicate glass carafe, dual-walled filter, and calibrated digital flow-rate scale. Designed for third-wave specialty coffee enthusiasts.",
      shortDescription: "Complete specialty pour-over brewing kit with precision scale.",
      price: 4999,
      compareAtPrice: 6999,
      stock: 35,
      sku: "HMK-COF-006",
      images: [
        {
          url: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=1000&auto=format&fit=crop&q=80",
          altText: "Trosto Artisan Coffee Station Setup",
          isPrimary: true,
        },
      ],
      variants: [{ sku: "HMK-COF-006-STD", color: "Brushed Brass & Walnut", stock: 35 }],
      specifications: {
        CarafeCapacity: "800ml (27oz)",
        Material: "Borosilicate Glass, Solid American Walnut, Solid Brass",
        FilterType: "Laser-etched Dual Mesh Stainless Steel",
      },
      rating: 4.8,
      numReviews: 39,
      isFeatured: true,
      tags: ["coffee", "kitchen", "pour-over", "home"],
    },
    {
      name: "Trosto Botanical Peptide Hydration Serum 50ml",
      slug: "trosto-botanical-peptide-hydration-serum",
      brand: "Trosto Skincare",
      category: createdCategories["beauty"]._id,
      description:
        "Intensive age-defying serum formulated with multi-molecular weight hyaluronic acid, copper tripeptide-1, and niacinamide. Strengthens the moisture barrier and smooths skin texture.",
      shortDescription: "Clinical multi-peptide serum with 2% pure hyaluronic acid.",
      price: 2499,
      compareAtPrice: 3499,
      stock: 80,
      sku: "BTY-SRM-007",
      images: [
        {
          url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1000&auto=format&fit=crop&q=80",
          altText: "Trosto Botanical Peptide Serum Glass Dropper",
          isPrimary: true,
        },
      ],
      variants: [{ sku: "BTY-SRM-007-50", size: "50ml", stock: 80 }],
      specifications: {
        KeyIngredients: "Copper Peptides, Hyaluronic Acid (Micro & Macro), Niacinamide 5%",
        SkinType: "All skin types, Dermatologist Tested",
        CrueltyFree: "100% Vegan & Leaping Bunny Certified",
      },
      rating: 4.7,
      numReviews: 81,
      isFeatured: false,
      tags: ["beauty", "skincare", "serum", "clean"],
    },
    {
      name: "Designing Data-Intensive Applications (Collector's Hardcover)",
      slug: "designing-data-intensive-applications-hardcover",
      brand: "Trosto Press",
      category: createdCategories["books"]._id,
      description:
        "The definitive guide to distributed systems, storage engines, consensus protocols, and stream processing by Martin Kleppmann. Premium embossed hardcover edition.",
      shortDescription: "The gold-standard architectural guide for distributed data systems.",
      price: 2199,
      compareAtPrice: 2899,
      stock: 40,
      sku: "BKS-DDIA-008",
      images: [
        {
          url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1000&auto=format&fit=crop&q=80",
          altText: "Data Architecture Book on Wooden Desk",
          isPrimary: true,
        },
      ],
      variants: [{ sku: "BKS-DDIA-008-HC", size: "Collector Hardcover", stock: 40 }],
      specifications: {
        Author: "Martin Kleppmann",
        Pages: "616 Pages",
        Publisher: "Trosto Tech Editions",
        Language: "English",
      },
      rating: 5.0,
      numReviews: 210,
      isFeatured: false,
      tags: ["books", "engineering", "architecture", "bestseller"],
    },
    {
      name: "Trosto Aviator Titanium Polarized Sunglasses",
      slug: "trosto-aviator-titanium-sunglasses",
      brand: "Trosto Eyewear",
      category: createdCategories["accessories"]._id,
      description:
        "Ultra-lightweight Japanese beta-titanium frames weighing merely 18 grams. Equipped with 9-layer polarized nylon lenses offering 100% UVA/UVB protection and anti-reflective back coating.",
      shortDescription: "Japanese beta-titanium aviators with 9-layer polarized lenses.",
      price: 4999,
      compareAtPrice: 7999,
      stock: 35,
      sku: "ACC-AVT-009",
      images: [
        {
          url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1000&auto=format&fit=crop&q=80",
          altText: "Trosto Aviator Titanium Sunglasses",
          isPrimary: true,
        },
      ],
      variants: [
        { sku: "ACC-AVT-009-GLD", color: "Champagne Gold Frame", colorCode: "#EAB308", stock: 15 },
        { sku: "ACC-AVT-009-GUN", color: "Gunmetal Frame", colorCode: "#475569", stock: 20 },
      ],
      specifications: {
        FrameMaterial: "Pure Japanese Beta-Titanium",
        Lens: "9-Layer High-Contrast Polarized CR-39",
        Weight: "18.4 Grams",
        UVProtection: "UV400 Category 3",
      },
      rating: 4.8,
      numReviews: 55,
      isFeatured: true,
      tags: ["sunglasses", "accessories", "titanium", "polarized"],
    },
  ];

  for (const prod of productsToSeed) {
    const createdProduct = await Product.create(prod);

    // Seed a couple of verified reviews for this product
    await Review.create({
      product: createdProduct._id,
      user: customer._id,
      userName: "Rahul S.",
      userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      rating: 5,
      title: "Exceptional build quality and fast delivery!",
      comment:
        "I was blown away by the craftsmanship. It arrived within 2 days in secure eco-friendly packaging. Highly recommended for anyone wanting top-tier quality.",
      isVerifiedPurchase: true,
      helpfulVotes: 12,
    });
  }

  // 4. Seed Coupons
  await Coupon.deleteMany({});
  await Coupon.create([
    {
      code: "WELCOME50",
      description: "50% off on your first order up to ₹500",
      discountType: "percentage",
      discountValue: 50,
      minOrderAmount: 499,
      maxDiscountAmount: 500,
      firstOrderOnly: true,
      isActive: true,
    },
    {
      code: "TROSTO20",
      description: "20% off on orders above ₹1,499 up to ₹1,000",
      discountType: "percentage",
      discountValue: 20,
      minOrderAmount: 1499,
      maxDiscountAmount: 1000,
      firstOrderOnly: false,
      isActive: true,
    },
    {
      code: "FESTIVE10",
      description: "Flat 10% off on all orders above ₹999",
      discountType: "percentage",
      discountValue: 10,
      minOrderAmount: 999,
      maxDiscountAmount: 2000,
      firstOrderOnly: false,
      isActive: true,
    },
  ]);

  return {
    success: true,
    message: "Database successfully seeded with categories, products, users, reviews, and coupons!",
    adminEmail: "admin@cartnova.com",
    adminPassword: "Admin@123456",
    customerEmail: "customer@cartnova.com",
    customerPassword: "Customer@123456",
  };
}
