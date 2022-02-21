import { getAwsSecretValue, getEnv } from 'get-env';
import * as AWS from 'aws';

// eslint-disable-next-line import/prefer-default-export
export const handler = async (event: any, context: any) => {
  console.log(event);
  const env = getEnv('NODE_ENV');
  const cluster = getEnv('ECS_CLUSTER_NAME');
  const launchType = getEnv('ECS_LAUNCH_TYPE');
  const subnet = getEnv('ECS_SUBNET') || '';
  const taskDefinitionArn = getEnv('ECS_TASK_DEFINITION_ARN') || '';
  const taskDefinitionName = getEnv('ECS_TASK_DEFINITION_NAME');
  const tenantName = event.userName.toLowerCase();
  const tfBucket = await getAwsSecretValue('TF_BUCKET')
  const ecs = new AWS.ECS(); 
  const params : AWS.ECS.Types.RunTaskRequest = {
      cluster: cluster, 
      taskDefinition: taskDefinitionArn,
      launchType:launchType,
      count: 1,
      platformVersion:'LATEST',
      networkConfiguration: {
          awsvpcConfiguration: {
            subnets: [subnet],
            assignPublicIp: 'ENABLED'
          }
      },
      overrides: {
        containerOverrides: [{
          name: taskDefinitionName,
          environment: [
            {
              name: 'TENANT_NAME',
              value: tenantName
            },
            {
              name: 'TF_BUCKET',
              value: tfBucket
            },
            {
              name: 'TF_BUCKET_KEY',
              value: 'base/backend/tenant_provision/environments/' + env + '/' + tenantName + '/terraform.tfstate'
            }
          ]
        }]
      }
    };
    await ecs.runTask(params).promise();
    return event;
};
