export interface User {
  id: string
  roleId: number
  fullName: string | null
  email: string
  isEmailVerified: boolean
  createdAt: Date
  updatedAt: Date | null
  isAdmin: boolean
}
