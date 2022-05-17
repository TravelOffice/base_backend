import { User } from '../../models/User';

export interface UserRepository {
  list: () => Promise<Array<User>>
  create: (user: User) => Promise<User>
  get: (id: string | number) => Promise<User>
  update: (id: string | number, user: User) => Promise<User>
  delete: (id: string | number) => Promise<void>
  listUsers: (
    filterKey: string,
    filterValue: string,
    limit?: number,
    paginationToken?: string,
  ) => Promise<Array<any>>
  saveToDynamo: (user: User) => Promise<void>
}
