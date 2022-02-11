import { User } from '../models/User';
import { cognitoProvider, dynamoProvider } from '../providers';
import { UserRepository } from './interfaces/UserRepository';

export default class UserRepositoryImpl implements UserRepository {
  list = async () => {
    throw new Error('Method not implemented!');
  };

  get = async (id: string | number) => {
    console.log(id);
    throw new Error('Method not implemented!');
  };

  create = async (user: User) => cognitoProvider.adminCreateUser(user);

  update = async (id: string | number, user: User) => {
    console.log(id, user);
    throw new Error('Method not implemented!');
  };

  delete = async (id: string | number) => {
    console.log(id);
    throw new Error('Method not implemented!');
  };

  saveToDynamo = async (user: User) => {
    await dynamoProvider.putItem('Users', user);
  };
}
