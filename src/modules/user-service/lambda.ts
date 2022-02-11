import serverlessExpress from '@vendia/serverless-express';
// import { getEnv } from 'get-env';
import app from './app';
// import { mongoProvider, sequelizeProvider } from './providers';

let serverlessExpressInstance: any;

async function init() {
  // Initialize connection to database
  // await mongoProvider.connect();
  // await sequelizeProvider.connect();
  // const env = await getEnv('NODE_ENV');
  // console.log('NODE_ENV', env);
}

async function setup(event: any, context: any) {
  await init();
  serverlessExpressInstance = serverlessExpress({ app });
  return serverlessExpressInstance(event, context);
}

// eslint-disable-next-line import/prefer-default-export
export const handler = async (event: any, context: any) => {
  if (serverlessExpressInstance) return serverlessExpressInstance(event, context);
  return setup(event, context);
};
