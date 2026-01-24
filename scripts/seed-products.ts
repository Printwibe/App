import { MongoClient } from "mongodb"
import { config } from "dotenv"

// Load environment variables from .env file
config()

const MONGODB_URI = process.env.MONGODB_URI

async function seedProducts() {
  if (!MONGODB_URI) {
    console.error("❌ Missing MONGODB_URI environment variable")
    console.log("\nPlease set MONGODB_URI in your .env file:")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=YourApp")
    process.exit(1)
  }

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("✓ Connected to MongoDB")

    const db = client.db("printwibe")
    const productsCollection = db.collection("products")

    // Check if products already exist
    const existingCount = await productsCollection.countDocuments()
    if (existingCount > 0) {
      console.log(`\n⚠️  Found ${existingCount} existing products in database`)
      console.log("Do you want to:")
      console.log("  1. Skip seeding (keep existing products)")
      console.log("  2. Clear and reseed all products")
      console.log("\nTo clear and reseed, delete products manually from MongoDB first.")
      await client.close()
      return
    }

    // Sample products with internet image URLs
    const products = [
      {
        name: "Classic Cotton T-Shirt",
        slug: "classic-cotton-t-shirt",
        description: "Premium 100% cotton t-shirt, perfect for custom printing. Soft, comfortable, and durable. Available in multiple sizes and colors.",
        category: "t-shirt",
        basePrice: 499,
        customizationPrice: 200,
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800",
          "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800"
        ],
        variants: [
          { size: "S", color: "White", stock: 50, sku: "TSHIRT-W-S" },
          { size: "M", color: "White", stock: 100, sku: "TSHIRT-W-M" },
          { size: "L", color: "White", stock: 80, sku: "TSHIRT-W-L" },
          { size: "XL", color: "White", stock: 60, sku: "TSHIRT-W-XL" },
          { size: "S", color: "Black", stock: 50, sku: "TSHIRT-B-S" },
          { size: "M", color: "Black", stock: 100, sku: "TSHIRT-B-M" },
          { size: "L", color: "Black", stock: 80, sku: "TSHIRT-B-L" },
          { size: "XL", color: "Black", stock: 60, sku: "TSHIRT-B-XL" }
        ],
        allowCustomization: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Premium Oversized T-Shirt",
        slug: "premium-oversized-t-shirt",
        description: "Trendy oversized fit t-shirt made from premium cotton blend. Extra comfortable with a modern streetwear look. Perfect canvas for bold designs.",
        category: "t-shirt",
        basePrice: 699,
        customizationPrice: 250,
        images: [
          "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800",
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800"
        ],
        variants: [
          { size: "M", color: "White", stock: 40, sku: "OVER-W-M" },
          { size: "L", color: "White", stock: 60, sku: "OVER-W-L" },
          { size: "XL", color: "White", stock: 50, sku: "OVER-W-XL" },
          { size: "M", color: "Black", stock: 40, sku: "OVER-B-M" },
          { size: "L", color: "Black", stock: 60, sku: "OVER-B-L" },
          { size: "XL", color: "Black", stock: 50, sku: "OVER-B-XL" },
          { size: "M", color: "Gray", stock: 35, sku: "OVER-G-M" },
          { size: "L", color: "Gray", stock: 45, sku: "OVER-G-L" }
        ],
        allowCustomization: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Formal Cotton Shirt",
        slug: "formal-cotton-shirt",
        description: "Professional cotton formal shirt with custom embroidery options. Perfect for corporate branding and uniforms. Wrinkle-resistant fabric.",
        category: "shirt",
        basePrice: 899,
        customizationPrice: 300,
        images: [
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800"
        ],
        variants: [
          { size: "S", color: "White", stock: 30, sku: "SHIRT-W-S" },
          { size: "M", color: "White", stock: 50, sku: "SHIRT-W-M" },
          { size: "L", color: "White", stock: 45, sku: "SHIRT-W-L" },
          { size: "XL", color: "White", stock: 35, sku: "SHIRT-W-XL" },
          { size: "S", color: "Blue", stock: 30, sku: "SHIRT-BL-S" },
          { size: "M", color: "Blue", stock: 50, sku: "SHIRT-BL-M" },
          { size: "L", color: "Blue", stock: 45, sku: "SHIRT-BL-L" },
          { size: "XL", color: "Blue", stock: 35, sku: "SHIRT-BL-XL" }
        ],
        allowCustomization: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Ceramic Coffee Mug",
        slug: "ceramic-coffee-mug",
        description: "High-quality ceramic mug with 360° printing area. Dishwasher and microwave safe. Perfect for personalized gifts and promotional items.",
        category: "mug",
        basePrice: 299,
        customizationPrice: 150,
        images: [
          "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800",
          "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=800"
        ],
        variants: [
          { size: "Standard", color: "White", stock: 200, sku: "MUG-W-STD" },
          { size: "Standard", color: "Black", stock: 150, sku: "MUG-B-STD" },
          { size: "Large", color: "White", stock: 100, sku: "MUG-W-LRG" },
          { size: "Large", color: "Black", stock: 80, sku: "MUG-B-LRG" }
        ],
        allowCustomization: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Magic Color Changing Mug",
        slug: "magic-color-changing-mug",
        description: "Heat-sensitive ceramic mug that reveals your design when hot liquid is added. Amazing surprise effect for gifts. High-quality printing.",
        category: "mug",
        basePrice: 449,
        customizationPrice: 200,
        images: [
          "https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800",
          "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800"
        ],
        variants: [
          { size: "Standard", color: "Black", stock: 100, sku: "MAGIC-B-STD" },
          { size: "Standard", color: "Blue", stock: 80, sku: "MAGIC-BL-STD" }
        ],
        allowCustomization: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Stainless Steel Water Bottle",
        slug: "stainless-steel-water-bottle",
        description: "Double-walled insulated stainless steel bottle. Keeps drinks cold for 24 hours, hot for 12 hours. BPA-free with laser engraving option.",
        category: "bottle",
        basePrice: 799,
        customizationPrice: 250,
        images: [
          "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800",
          "https://images.unsplash.com/photo-1586063719650-e0c19207094e?w=800"
        ],
        variants: [
          { size: "500ml", color: "Silver", stock: 80, sku: "BTL-S-500" },
          { size: "750ml", color: "Silver", stock: 70, sku: "BTL-S-750" },
          { size: "1000ml", color: "Silver", stock: 60, sku: "BTL-S-1000" },
          { size: "500ml", color: "Black", stock: 80, sku: "BTL-B-500" },
          { size: "750ml", color: "Black", stock: 70, sku: "BTL-B-750" },
          { size: "1000ml", color: "Black", stock: 60, sku: "BTL-B-1000" }
        ],
        allowCustomization: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Sports Sipper Bottle",
        slug: "sports-sipper-bottle",
        description: "Lightweight BPA-free plastic bottle with sipper cap. Perfect for gym, sports, and outdoor activities. Full-color printing available.",
        category: "bottle",
        basePrice: 349,
        customizationPrice: 150,
        images: [
          "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800",
          "https://images.unsplash.com/photo-1617636477493-e2e22e34dc5e?w=800"
        ],
        variants: [
          { size: "600ml", color: "Clear", stock: 120, sku: "SIP-C-600" },
          { size: "600ml", color: "Blue", stock: 100, sku: "SIP-BL-600" },
          { size: "600ml", color: "Red", stock: 100, sku: "SIP-R-600" },
          { size: "1000ml", color: "Clear", stock: 80, sku: "SIP-C-1000" },
          { size: "1000ml", color: "Blue", stock: 70, sku: "SIP-BL-1000" }
        ],
        allowCustomization: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Insert products
    const result = await productsCollection.insertMany(products)
    console.log(`\n✓ Successfully seeded ${result.insertedCount} products`)
    
    console.log("\n📦 Products created:")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.category})`)
      console.log(`   Price: ₹${product.basePrice} + ₹${product.customizationPrice} customization`)
      console.log(`   Variants: ${product.variants.length} options`)
      console.log(`   Images: ${product.images.length} images`)
    })

    console.log("\n✅ Product seeding completed successfully!")
    console.log("\n💡 You can now:")
    console.log("   • View products in admin panel: http://localhost:3000/v1/admin/products")
    console.log("   • Browse products on frontend: http://localhost:3000/products")
    console.log("   • Add more products via admin panel")

  } catch (error) {
    console.error("\n❌ Error seeding products:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("\n✓ Database connection closed")
  }
}

// Run the seed function
seedProducts()
