import { User } from '../../models/User';

export interface CreateUserUseCase {
  invoke: (user: User) => Promise<User>;
}
