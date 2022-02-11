import { User } from '../../models/User';

export interface GetUserListUseCase {
  invoke: () => Promise<Array<User>>;
}
