import * as AWS from 'aws';
import { getEnv } from 'get-env';
import { User } from '../models/User';
import { toUser, toUserAttributes } from '../utils/utils';

export default class CognitoProvider {
  adminCreateUser = async (user: User) : Promise<User> => {
    const params : AWS.CognitoIdentityServiceProvider.AdminCreateUserRequest = {
      UserPoolId: getEnv('USER_POOL_ID') || '',
      Username: user.username,
      UserAttributes: toUserAttributes(user),
      DesiredDeliveryMediums: ['EMAIL'],
    };
    const provider = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-19' });
    const data = await provider.adminCreateUser(params).promise();
    return toUser(data.User) || user;
  };
}
