import { User } from '../../models/User';

export interface UpdateUserUseCase {
  invoke: (id: string | number, user: User) => Promise<User>;
}
