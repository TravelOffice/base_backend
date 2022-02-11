// Declare providers which should be used in this service here

import CognitoProvider from './CognitoProvider';
import DynamoProvider from './DynamoProvider';
import MongoProvider from './MongoProvider';
import SequelizeProvider from './SequelizeProvider';

interface Providers {
  mongoProvider: MongoProvider,
  sequelizeProvider: SequelizeProvider,
  dynamoProvider: DynamoProvider,
  cognitoProvider: CognitoProvider,
}

const providers : Providers = {
  mongoProvider: new MongoProvider(),
  sequelizeProvider: new SequelizeProvider(),
  dynamoProvider: new DynamoProvider(),
  cognitoProvider: new CognitoProvider(),
};

export const {
  mongoProvider,
  sequelizeProvider,
  dynamoProvider,
  cognitoProvider,
} = providers;
