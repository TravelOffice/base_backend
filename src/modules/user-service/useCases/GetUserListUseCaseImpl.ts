import { userRepository } from '../repositories';
import { GetUserListUseCase } from './interfaces/GetUserListUseCase';

export default class GetUserListUseCaseImpl implements GetUserListUseCase {
  invoke = async () => userRepository.list();
}
