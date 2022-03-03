import * as AWS from 'aws';
import { getAwsSecretValue } from 'get-env';
import { User } from '../models/User';
import { toUser, toUserAttributes } from '../utils/utils';

const provider = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-19' });
export default class CognitoProvider {
  adminCreateUser = async (user: User) : Promise<User> => {
    const params : AWS.CognitoIdentityServiceProvider.AdminCreateUserRequest = {
      UserPoolId: await getAwsSecretValue('COGNITO_USER_POOL_ID') || '',
      Username: user.username,
      UserAttributes: toUserAttributes(user),
      DesiredDeliveryMediums: ['EMAIL'],
    };
    console.log('params', params);
    const data = await provider.adminCreateUser(params).promise();
    return toUser(data.User) || user;
  };

  listUsers = async (filterKey: string, filterValue: string, limit: number = 1, paginationToken: string = ''): Promise<Array<any>> => {
    let params: AWS.CognitoIdentityServiceProvider.ListUsersRequest = {
      UserPoolId: await getAwsSecretValue('COGNITO_USER_POOL_ID') || '',
      Filter: `${filterKey} = "${filterValue}"`
    };
    if (paginationToken !== '') {
      params = {
        UserPoolId: await getAwsSecretValue('COGNITO_USER_POOL_ID') || '',
        Filter: `${filterKey} = "${filterValue}"`,
        Limit: limit,
        PaginationToken: paginationToken
      };
    }
    console.log('params', params);
    const data = await provider.listUsers(params).promise();
    return data.Users || [];
  }
}
