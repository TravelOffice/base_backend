// Declare providers which should be used in this service here

import MongoProvider from './MongoProvider';
import SequelizeProvider from './SequelizeProvider';

interface Providers {
  mongoProvider: MongoProvider,
  sequelizeProvider: SequelizeProvider,
}

const providers : Providers = {
  mongoProvider: new MongoProvider(),
  sequelizeProvider: new SequelizeProvider(),
};

export const {
  mongoProvider,
  sequelizeProvider,
} = providers;
