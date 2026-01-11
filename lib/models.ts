import { getDatabase } from "./mongodb"

// Order model/collection operations
export const Order = {
  collection: async () => {
    const db = await getDatabase()
    return db.collection("orders")
  },

  findById: async (id: string) => {
    const db = await getDatabase()
    const { ObjectId } = await import("mongodb")
    return db.collection("orders").findOne({ _id: new ObjectId(id) })
  },

  findByIdAndUpdate: async (id: string, data: Record<string, any>, options: any = {}) => {
    const db = await getDatabase()
    const { ObjectId } = await import("mongodb")
    const result = await db
      .collection("orders")
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: data }, { returnDocument: "after" })
    return result.value
  },

  find: async (query: Record<string, any> = {}) => {
    const db = await getDatabase()
    return db.collection("orders").find(query).toArray()
  },

  insertOne: async (data: Record<string, any>) => {
    const db = await getDatabase()
    return db.collection("orders").insertOne(data)
  },
}

// User model/collection operations
export const User = {
  collection: async () => {
    const db = await getDatabase()
    return db.collection("users")
  },

  findOne: async (query: Record<string, any>) => {
    const db = await getDatabase()
    return db.collection("users").findOne(query)
  },

  findById: async (id: string) => {
    const db = await getDatabase()
    const { ObjectId } = await import("mongodb")
    return db.collection("users").findOne({ _id: new ObjectId(id) })
  },

  insertOne: async (data: Record<string, any>) => {
    const db = await getDatabase()
    return db.collection("users").insertOne(data)
  },

  updateOne: async (query: Record<string, any>, data: Record<string, any>) => {
    const db = await getDatabase()
    return db.collection("users").updateOne(query, { $set: data })
  },
}

// Product model/collection operations
export const Product = {
  collection: async () => {
    const db = await getDatabase()
    return db.collection("products")
  },

  findOne: async (query: Record<string, any>) => {
    const db = await getDatabase()
    return db.collection("products").findOne(query)
  },

  find: async (query: Record<string, any> = {}) => {
    const db = await getDatabase()
    return db.collection("products").find(query).toArray()
  },

  insertOne: async (data: Record<string, any>) => {
    const db = await getDatabase()
    return db.collection("products").insertOne(data)
  },

  updateOne: async (query: Record<string, any>, data: Record<string, any>) => {
    const db = await getDatabase()
    return db.collection("products").updateOne(query, { $set: data })
  },
}

// Cart model/collection operations
export const Cart = {
  collection: async () => {
    const db = await getDatabase()
    return db.collection("carts")
  },

  findOne: async (query: Record<string, any>) => {
    const db = await getDatabase()
    return db.collection("carts").findOne(query)
  },

  updateOne: async (query: Record<string, any>, data: Record<string, any>) => {
    const db = await getDatabase()
    return db.collection("carts").updateOne(query, { $set: data }, { upsert: true })
  },
}

// CustomDesign model/collection operations
export const CustomDesign = {
  collection: async () => {
    const db = await getDatabase()
    return db.collection("customDesigns")
  },

  insertOne: async (data: Record<string, any>) => {
    const db = await getDatabase()
    return db.collection("customDesigns").insertOne(data)
  },

  findOne: async (query: Record<string, any>) => {
    const db = await getDatabase()
    return db.collection("customDesigns").findOne(query)
  },
}
