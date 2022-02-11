import { User } from '../../models/User';

export interface GetUserUseCase {
  invoke: (id: string | number) => Promise<User>;
}
