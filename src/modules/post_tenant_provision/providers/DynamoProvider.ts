import * as AWS from 'aws';
import { getEnv } from 'get-env';

type PutItemInput = AWS.DynamoDB.PutItemInput;
type GetItemInput = AWS.DynamoDB.GetItemInput;

const dynamoDB : AWS.DynamoDB = new AWS.DynamoDB({ region: getEnv('AWS_REGION') });

export default class DynamoProvider {
  putItem = async (table: string, pk: string, sk: string, data: any) => {
    const params : PutItemInput = {
      TableName: table,
      Item: AWS.DynamoDB.Converter.marshall({ pk, sk, ...data }),
    };
    return dynamoDB.putItem(params).promise();
  };
}