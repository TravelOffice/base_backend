import { userRepository } from '../repositories';
import { DeleteUserUseCase } from './interfaces/DeleteUserUseCase';

export default class DeleteUserUseCaseImpl implements DeleteUserUseCase {
  invoke = async (id: string | number) => userRepository.delete(id);
}
