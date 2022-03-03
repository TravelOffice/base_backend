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

  listUsers = async (filterKey: string, filterValue: string, limit: number = 1, paginationToken: string = '') => cognitoProvider.listUsers(filterKey, filterValue, limit, paginationToken);

  saveToDynamo = async (user: User) => {
    await dynamoProvider.putItem('Users', user);
  };
}
