import CreateUserUseCaseImpl from './CreateUserUseCaseImpl';
import DeleteUserUseCaseImpl from './DeleteUserUseCaseImpl';
import GetUserListUseCaseImpl from './GetUserListUseCaseImpl';
import GetUserUseCaseImpl from './GetUserUseCaseImpl';
import { CreateUserUseCase } from './interfaces/CreateUserUseCase';
import { DeleteUserUseCase } from './interfaces/DeleteUserUseCase';
import { GetUserListUseCase } from './interfaces/GetUserListUseCase';
import { GetUserUseCase } from './interfaces/GetUserUseCase';
import { UpdateUserUseCase } from './interfaces/UpdateUserUseCase';
import UpdateUserUseCaseImpl from './UpdateUserUseCaseImpl';

interface UseCases {
  createUserUseCase: CreateUserUseCase,
  getUserListUseCase: GetUserListUseCase,
  getUserUseCase: GetUserUseCase,
  updateUserUseCase: UpdateUserUseCase,
  deleteUserUseCase: DeleteUserUseCase,
}

const useCases : UseCases = {
  createUserUseCase: new CreateUserUseCaseImpl(),
  getUserListUseCase: new GetUserListUseCaseImpl(),
  getUserUseCase: new GetUserUseCaseImpl(),
  updateUserUseCase: new UpdateUserUseCaseImpl(),
  deleteUserUseCase: new DeleteUserUseCaseImpl(),
};

export const {
  createUserUseCase,
  getUserListUseCase,
  getUserUseCase,
  updateUserUseCase,
  deleteUserUseCase,
} = useCases;
