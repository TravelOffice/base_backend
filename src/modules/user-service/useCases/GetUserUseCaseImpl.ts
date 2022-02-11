import { userRepository } from '../repositories';
import { GetUserUseCase } from './interfaces/GetUserUseCase';

export default class GetUserUseCaseImpl implements GetUserUseCase {
  invoke = (id: string | number) => userRepository.get(id);
}
