import * as AWS from 'aws';

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
  const data = await client.getSecretValue({SecretId: key}).promise();
  return data.SecretString;
}

export async function getEnv(key: string) : Promise<string | undefined> {
  if (isAwsEnv()) {
    return getAwsSecretValue(key);
  } else {
    return process.env[key];
  }
}