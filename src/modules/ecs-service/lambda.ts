import * as AWS from 'aws';
import { getAwsSecretValue, getEnv } from 'get-env';

const env = getEnv('NODE_ENV');
const cluster = getEnv('ECS_CLUSTER_NAME');
const launchType = getEnv('ECS_LAUNCH_TYPE');
const subnet = getEnv('ECS_SUBNET');
const taskDefinitionArn = getEnv('ECS_TASK_DEFINITION_ARN');
const taskDefinitionName = getEnv('ECS_TASK_DEFINITION_NAME');
const postLambdaName = getEnv('POST_TENANT_PROVISION_LAMBDA');

// eslint-disable-next-line import/prefer-default-export
export const handler = async (event: any) => {
  console.info(`[handler] Received event ${event}`);
  const tenantRole = event.request.userAttributes['custom:role'];
  if (tenantRole !== 'ADMIN') return event; // Stop if user is not admin who represent an enterprise

  // Start provisioning process
  const tenantName = event.userName.toLowerCase();
  const tenantPhone = event.request.userAttributes.phone_number;
  const tenantEmail = event.request.userAttributes.email;
  const tfBucket = await getAwsSecretValue('TF_BUCKET');
  const ecs = new AWS.ECS();
  const params: AWS.ECS.Types.RunTaskRequest = {
    cluster,
    taskDefinition: taskDefinitionArn,
    launchType,
    count: 1,
    platformVersion: 'LATEST',
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: [subnet],
        assignPublicIp: 'ENABLED',
      },
    },
    overrides: {
      containerOverrides: [{
        name: taskDefinitionName,
        environment: [
          {
            name: 'TENANT_NAME',
            value: tenantName,
          },
          {
            name: 'TENANT_EMAIL',
            value: tenantEmail,
          },
          {
            name: 'TENANT_PHONE',
            value: tenantPhone,
          },
          {
            name: 'TF_BUCKET',
            value: tfBucket,
          },
          {
            name: 'TF_BUCKET_KEY',
            value: `base/backend/tenant_provision/environments/${env}/${tenantName}/terraform.tfstate`,
          },
          {
            name: 'POST_LAMBDA_NAME',
            value: postLambdaName,
          },
        ],
      }],
    },
  };
  console.log(params);
  // Init ECS task
  await ecs.runTask(params).promise();

  return event;
};
