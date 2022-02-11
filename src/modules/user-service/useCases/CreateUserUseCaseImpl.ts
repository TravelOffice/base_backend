import { User } from '../models/User';
import { userRepository } from '../repositories';
import { CreateUserUseCase } from './interfaces/CreateUserUseCase';

export default class CreateUserUseCaseImpl implements CreateUserUseCase {
  invoke = async (user: User) => {
    const createdUser = await userRepository.create(user);
    // await userRepository.saveToDynamo(createdUser);
    // TODO: save to dynamo
    return createdUser;
  };
}
