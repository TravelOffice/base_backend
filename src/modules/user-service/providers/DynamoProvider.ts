import * as AWS from 'aws';

type PutItemInput = AWS.DynamoDB.PutItemInput;

const dynamoDB = new AWS.DynamoDB({ endpoint: 'http://localhost:4566' });

export default class DynamoProvider {
  putItem = async (table: string, data: any) => {
    const params : PutItemInput = {
      TableName: table,
      Item: AWS.DynamoDB.Converter.marshall(data),
    };
    return dynamoDB.putItem(params).promise();
  };
}
