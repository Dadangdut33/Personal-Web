import User from '#models/user'
import BaseRepository from '#repositories/_base_repository'
import { UserPayload } from '#types/inferred'

export default class UserRepository extends BaseRepository<typeof User> {
  constructor() {
    super(User)
  }

  async updateOrCreateUser(data: UserPayload) {
    const { id } = data

    const user = await this.model.updateOrCreate(
      { id }, // search criteria
      data // data to update or create
    )

    // sync the roles
    if (data.roles) await user.related('roles').sync(data.roles)

    return user
  }
}
