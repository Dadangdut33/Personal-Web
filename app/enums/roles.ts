export enum Roles {
  USER = 1,
  EDITOR = 2,
  MODERATOR = 3,
  ADMIN = 19,
  SUPER_ADMIN = 20,
}

export const roleMap: Record<string, number> = {
  user: Roles.USER,
  editor: Roles.EDITOR,
  moderator: Roles.MODERATOR,
  admin: Roles.ADMIN,
  superAdmin: Roles.SUPER_ADMIN,
}

export const roleValue = Object.values(Roles).filter((v) => typeof v === 'number') as number[]
export const roleName = Object.keys(Roles).filter((v) =>
  Number.isNaN(Number(v))
) as (keyof typeof Roles)[]

export default Roles
