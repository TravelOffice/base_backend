import { User } from '../models/User';
import { userRepository } from '../repositories';
import { CreateUserUseCase } from './interfaces/CreateUserUseCase';

export default class CreateUserUseCaseImpl implements CreateUserUseCase {
  invoke = async (user: User) => {
    // Check duplicated email
    const matchedUsers = await userRepository.listUsers('email', user.email);
    if (matchedUsers.length > 0){
      throw new Error(`User with email ${user.email} already exist`);
    }
    const createdUser = await userRepository.create(user);
    // await userRepository.saveToDynamo(createdUser);
    // TODO: save to dynamo
    return createdUser;
  };
}
