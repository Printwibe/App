import { getDatabase } from "../mongodb"
import { ObjectId } from "mongodb"

export interface Notification {
  _id?: ObjectId
  type: "new_order" | "order_cancelled" | "customized_order"
  title: string
  message: string
  orderId: string
  orderNumber: string
  isRead: boolean
  createdAt: Date
}

export const Notifications = {
  collection: async () => {
    const db = await getDatabase()
    return db.collection<Notification>("notifications")
  },

  create: async (data: Omit<Notification, "_id" | "createdAt">) => {
    const db = await getDatabase()
    const notification = {
      ...data,
      createdAt: new Date()
    }
    const result = await db.collection<Notification>("notifications").insertOne(notification)
    return result
  },

  findRecent: async (limit: number = 20) => {
    const db = await getDatabase()
    return db.collection<Notification>("notifications")
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
  },

  countUnread: async () => {
    const db = await getDatabase()
    return db.collection<Notification>("notifications").countDocuments({ isRead: false })
  },

  markAsRead: async (id: string) => {
    const db = await getDatabase()
    return db.collection<Notification>("notifications").updateOne(
      { _id: new ObjectId(id) },
      { $set: { isRead: true } }
    )
  },

  markAllAsRead: async () => {
    const db = await getDatabase()
    return db.collection<Notification>("notifications").updateMany(
      { isRead: false },
      { $set: { isRead: true } }
    )
  }
}
