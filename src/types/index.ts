export type Customer = {
  id: string
  firstName: string
  surname: string | null
  phone: string | null
  email: string | null
  serialNumber: string
  createdAt: string
  externalUserId: string | null
}

export type CardInfo = {
  id: string
  serialNumber: string
  createdAt: string
  stamps: number
  rewards: number
  comment: string | null
  downloadUrl: string | null
  installLink: string | null
  shareLink: string | null
  customer: Customer
}

export type Gender = 0 | 1 | 2

export type StampPayload = {
  id: string
  stamps: number
  comment: string
  purchaseSum: number
  templateId: number
}

export type RewardPayload = {
  id: string
  rewards: number
  comment: string
  purchaseSum: number
  templateId: number
}

export type CreateCustomerPayload = {
  firstName: string
  surname?: string | null
  phone: string
  email?: string | null
  gender?: Gender
  dateOfBirth?: string | null
  externalUserId?: string | null
  templateId: number
}

export type ActivityLog = {
  id: string
  timestamp: string
  cardNumber: string
  action: 'add-stamp' | 'subtract-stamp' | 'subtract-reward'
  count: number
  comment?: string
}
