import * as AWS from 'aws';
import { User } from '../models/User';

type AttributeListType = AWS.CognitoIdentityServiceProvider.AttributeListType;
type UserType = AWS.CognitoIdentityServiceProvider.UserType;

export function toUserAttributeName(name: string) {
  switch (name) {
    case 'firstName': return 'given_name';
    case 'lastName': return 'family_name';
    default: return name;
  }
}

export function toUserAttributes(user: User) : Array<any> {
  const userAttributes : Array<any> = [];
  Object.entries(user).forEach((entry) => {
    const [name, value] = entry;
    if (name && name !== 'username') {
      userAttributes.push({
        Name: toUserAttributeName(name),
        Value: value,
      });
    }
  });
  return userAttributes;
}

export function getUserAttribute(name: string, attributes?: AttributeListType) {
  if (!attributes) {
    return undefined;
  }
  return attributes.find((attribute) => attribute.Name === name)?.Value;
}

export function toUser(user?: UserType) : User | undefined {
  if (!user) {
    return undefined;
  }
  const userAttributes = user.Attributes;
  if (!userAttributes) {
    return undefined;
  }
  return {
    username: user.Username || '',
    email: getUserAttribute('email', userAttributes) || '',
    firstName: getUserAttribute('given_name', userAttributes) || '',
    lastName: getUserAttribute('family_name', userAttributes) || '',
  };
}
