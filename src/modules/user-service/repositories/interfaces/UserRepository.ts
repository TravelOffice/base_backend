import { User } from '../../models/User';

export interface UserRepository {
  list: () => Promise<Array<User>>
  create: (user: User) => Promise<User>
  get: (id: string | number) => Promise<User>
  update: (id: string | number, user: User) => Promise<User>
  delete: (id: string | number) => Promise<void>
  saveToDynamo: (user: User) => Promise<void>
}
