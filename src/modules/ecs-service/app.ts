import cors from 'cors';
import express, { Request, Response } from 'express';
import { getEnv } from 'get-env';
import compression from 'compression';
import * as AWS from 'aws';

const app = express();

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/ecs/tasks', async (req: Request, res: Response) => {
  const env = await getEnv('ENV');
  const cluster = await getEnv('ECS_CLUSTER_NAME');
  const launchType = await getEnv('ECS_LAUNCH_TYPE');
  const subnet = await getEnv('ECS_SUBNET') || '';
  const taskDefinitionArn = await getEnv('ECS_TASK_DEFINITION_ARN') || '';
  const taskDefinitionName = await getEnv('ECS_TASK_DEFINITION_NAME');
  const tenantName = 'tenant_name';
  const tenantDomainRecord = env + '.d1lwjda5hcw2sf.amplifyapp.com';
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
            assignPublicIp: 'DISABLED'
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
              name: 'TENANT_DOMAIN_RECORD_VALUE',
              value: tenantDomainRecord
            },
            {
              name: 'TF_BUCKET',
              value: 'terraform-state20220108143755951900000001'
            },
            {
              name: 'TF_BUCKET_KEY',
              value: 'base/backend/tenant_provision/' + env + '/' + tenantName + '/terraform.tfstate'
            }
          ]
        }]
      }
    };
    await ecs.runTask(params).promise();
    res.json({ message: 'hello' });
});

export default app;
