export interface User {
  id: string
  roleId: number
  fullName: string | null
  email: string
  isEmailVerified: boolean
  created_at: Date
  update_at: Date | null
  isAdmin: boolean
}
