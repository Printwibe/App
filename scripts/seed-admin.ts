import { MongoClient } from "mongodb"
import * as bcrypt from "bcryptjs"
import { config } from "dotenv"

// Load environment variables from .env file
config()

// Load environment variables - NO FALLBACKS for security
const MONGODB_URI = process.env.MONGODB_URI
const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD
const ADMIN_NAME = process.env.ADMIN_SEED_NAME

async function seedAdmin() {
  // Validate all required environment variables
  const missingVars: string[] = []
  
  if (!MONGODB_URI) missingVars.push("MONGODB_URI")
  if (!ADMIN_EMAIL) missingVars.push("ADMIN_SEED_EMAIL")
  if (!ADMIN_PASSWORD) missingVars.push("ADMIN_SEED_PASSWORD")
  if (!ADMIN_NAME) missingVars.push("ADMIN_SEED_NAME")

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:")
    missingVars.forEach(v => console.error(`   - ${v}`))
    console.log("\n⚠️  SECURITY: Never use hardcoded credentials!")
    console.log("\nPlease set these in your .env file:")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/printwibe")
    console.log("ADMIN_SEED_EMAIL=your-admin@email.com")
    console.log("ADMIN_SEED_PASSWORD=your-strong-password")
    console.log("ADMIN_SEED_NAME=Your Admin Name")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("\n⚠️  Remember: Never commit .env file to git!")
    process.exit(1)
  }

  // Type assertions - safe after validation above
  const mongoUri = MONGODB_URI as string
  const adminEmail = ADMIN_EMAIL as string
  const adminPassword = ADMIN_PASSWORD as string
  const adminName = ADMIN_NAME as string

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(adminEmail)) {
    console.error("❌ ADMIN_SEED_EMAIL must be a valid email address")
    process.exit(1)
  }

  // Validate password strength
  if (adminPassword.length < 12) {
    console.error("❌ ADMIN_SEED_PASSWORD must be at least 12 characters")
    process.exit(1)
  }

  if (!/[A-Z]/.test(adminPassword)) {
    console.error("❌ ADMIN_SEED_PASSWORD must contain at least one uppercase letter")
    process.exit(1)
  }

  if (!/[a-z]/.test(adminPassword)) {
    console.error("❌ ADMIN_SEED_PASSWORD must contain at least one lowercase letter")
    process.exit(1)
  }

  if (!/[0-9]/.test(adminPassword)) {
    console.error("❌ ADMIN_SEED_PASSWORD must contain at least one number")
    process.exit(1)
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(adminPassword)) {
    console.error("❌ ADMIN_SEED_PASSWORD must contain at least one special character")
    process.exit(1)
  }

  const client = new MongoClient(mongoUri)

  try {
    console.log("🔄 Connecting to MongoDB...")
    await client.connect()

    const db = client.db()
    const adminsCollection = db.collection("admins")

    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({
      email: adminEmail,
    })

    if (existingAdmin) {
      console.log(`✓ Admin already exists with email: ${adminEmail}`)
      console.log("\nIf you need to reset the password:")
      console.log("1. Delete the admin from MongoDB admins collection")
      console.log("2. Update ADMIN_SEED_EMAIL/PASSWORD in .env file")
      console.log("3. Run this script again")
      return
    }

    // Hash password
    console.log("🔐 Hashing password...")
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Create admin
    const result = await adminsCollection.insertOne({
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: "admin",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log("\n✅ Admin created successfully!")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log(`   Admin ID: ${result.insertedId}`)
    console.log(`   Name:     ${adminName}`)
    console.log(`   Email:    ${adminEmail}`)
    console.log(`   Password: ••••••••••••`) // Never log actual password
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("\n🔐 Password is securely hashed in database")
    console.log("\n⚠️  SECURITY REMINDERS:")
    console.log("  • Delete ADMIN_SEED_* variables from .env after first use")
    console.log("  • Change the password immediately after first login")
    console.log("  • Never commit .env file to version control")
    console.log("  • Store credentials in a secure password manager")
    console.log("\n🌐 Login at: http://localhost:3000/v1/admin/login")
    console.log("\nTo create another admin, update these env variables:")
    console.log("  - ADMIN_SEED_EMAIL")
    console.log("  - ADMIN_SEED_PASSWORD (min 12 chars, uppercase, lowercase, number, special char)")
    console.log("  - ADMIN_SEED_NAME")
  } catch (error) {
    console.error("❌ Error seeding admin:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("\n🔌 Database connection closed")
  }
}

seedAdmin()
