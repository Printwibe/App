import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export interface PaymentSettings {
  _id?: ObjectId
  razorpay: {
    enabled: boolean
    keyId?: string
    keySecret?: string
  }
  cod: {
    enabled: boolean
  }
  manualPayments: {
    upi: {
      enabled: boolean
      upiId?: string
    }
    qrCode: {
      enabled: boolean
      qrCodeUrl?: string
    }
  }
  updatedAt: Date
}

export async function getPaymentSettings(): Promise<PaymentSettings | null> {
  const db = await getDatabase()
  const settings = await db.collection<PaymentSettings>('paymentSettings').findOne({})
  return settings
}

export async function updatePaymentSettings(settings: Partial<PaymentSettings>): Promise<boolean> {
  const db = await getDatabase()
  const result = await db.collection('paymentSettings').updateOne(
    {},
    { $set: { ...settings, updatedAt: new Date() } },
    { upsert: true }
  )
  return result.acknowledged
}
