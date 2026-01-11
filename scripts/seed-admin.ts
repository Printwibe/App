import { MongoClient } from "mongodb"
import * as bcrypt from "bcryptjs"

// Load environment variables
const MONGODB_URI = process.env.MONGODB_URI || ""

async function seedAdmin() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set in environment variables")
    console.log("\nPlease set MONGODB_URI in your .env.local file:")
    console.log("MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/printwibe")
    process.exit(1)
  }

  const client = new MongoClient(MONGODB_URI)

  try {
    console.log("🔄 Connecting to MongoDB...")
    await client.connect()

    const db = client.db()
    const adminsCollection = db.collection("admins")

    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({
      email: "admin@printwibe.com",
    })

    if (existingAdmin) {
      console.log("✓ Admin already exists with email: admin@printwibe.com")
      console.log("\nIf you need to reset the password, delete the admin from MongoDB and run this script again.")
      return
    }

    // Hash password
    console.log("🔐 Hashing password...")
    const hashedPassword = await bcrypt.hash("admin123456", 10)

    // Create admin
    const result = await adminsCollection.insertOne({
      email: "admin@printwibe.com",
      password: hashedPassword,
      name: "PrintWibe Admin",
      role: "admin",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log("\n✅ Admin created successfully!")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log(`   Admin ID: ${result.insertedId}`)
    console.log("   Email:    admin@printwibe.com")
    console.log("   Password: admin123456")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("\n⚠️  IMPORTANT: Change the password after first login!")
    console.log("\nLogin at: http://localhost:3000/v1/admin/login")
  } catch (error) {
    console.error("❌ Error seeding admin:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("\n🔌 Database connection closed")
  }
}

seedAdmin()
