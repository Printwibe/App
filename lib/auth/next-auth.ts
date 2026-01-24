import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { verifyPassword } from "@/lib/auth"
import type { User } from "@/lib/types"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password")
        }

        const db = await getDatabase()
        const user = await db.collection<User>("users").findOne({
          email: credentials.email.toLowerCase()
        })

        if (!user) {
          throw new Error("Invalid email or password")
        }

        // Check if user registered with Google
        if (user.provider === "google" && !user.password) {
          throw new Error("This account was created with Google. Please sign in with Google.")
        }

        // Verify password
        if (!user.password || !(await verifyPassword(credentials.password, user.password))) {
          throw new Error("Invalid email or password")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image || null,
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const db = await getDatabase()
          const email = user.email?.toLowerCase()

          if (!email) {
            return false
          }

          // Check if user exists
          const existingUser = await db.collection<User>("users").findOne({
            email: email
          })

          if (existingUser) {
            // Update last login and Google info if needed
            await db.collection<User>("users").updateOne(
              { email: email },
              {
                $set: {
                  image: user.image || existingUser.image,
                  provider: "google",
                  googleId: account.providerAccountId,
                  updatedAt: new Date(),
                }
              }
            )
          } else {
            // Create new user
            await db.collection("users").insertOne({
              name: user.name || "",
              email: email,
              image: user.image || null,
              provider: "google",
              googleId: account.providerAccountId,
              role: "user",
              phone: null,
              dob: null,
              password: null, // No password for Google users
              addresses: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }

          return true
        } catch (error) {
          console.error("Error during Google sign in:", error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      if (account?.provider === "google") {
        token.provider = "google"
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }

      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
