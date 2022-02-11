import * as AWS from 'aws';
import dotenv from 'dotenv';
dotenv.config({ path: process.cwd() + '/.env.development' });
const client = new AWS.SecretsManager({});

export function isAwsEnv() {
  return !!process.env.AWS_REGION;
}

export function isDevEnv() {
  const env = process.env.NODE_ENV;
  if (!env) {
    throw new Error('Please specify the dev or prod environment!');
  }
  return env === 'dev';
}

export async function getAwsSecretValue(key: string) : Promise<string | undefined> {
  if (isAwsEnv()) {
    const secretId = process.env.SECRET_MANAGER_ID || '';
    if(!secretId) {
      const data = await client.getSecretValue({SecretId: secretId}).promise();
      const dataJson = JSON.parse(data.SecretString || {}.toString());
      return dataJson[key];
    }  
  } else {
    return process.env[key];
  }
}

export function getEnv(key: string) : string | undefined {
  return process.env[key];
}
