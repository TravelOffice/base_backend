import * as AWS from 'aws';
import { getEnv } from 'get-env';

export type PutItemInput = AWS.DynamoDB.PutItemInput;
export type GetItemInput = AWS.DynamoDB.GetItemInput;
export type QueryInput = AWS.DynamoDB.QueryInput;
export type DeleteItemInput = AWS.DynamoDB.DeleteItemInput
const dynamoDB : AWS.DynamoDB = new AWS.DynamoDB({ region: getEnv('AWS_REGION') });

export default class DynamoProvider {
  putItem = async (table: string, pk: string, sk: string, data: any) => {
    const params : PutItemInput = {
      TableName: table,
      Item: AWS.DynamoDB.Converter.marshall({ pk, sk, ...data }),
    };
    return dynamoDB.putItem(params).promise();
  };

  getItem = async <T = any>(table: string, pk: string, sk: string) : Promise< T | undefined> => {
    const params : GetItemInput = {
      TableName: table,
      Key: AWS.DynamoDB.Converter.marshall({ pk, sk }),
    };
    const { Item } = await dynamoDB.getItem(params).promise();
    if (!Item) {
      return undefined;
    }
    return AWS.DynamoDB.Converter.unmarshall(Item) as T;
  };
}
