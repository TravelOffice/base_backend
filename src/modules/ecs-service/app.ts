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
  // const env = await getEnv('NODE_ENV');
  const cluster = await getEnv('ECS_CLUSTER_NAME');
  const launchType = await getEnv('ECS_LAUNCH_TYPE');
  const subnet = await getEnv('ECS_SUBNET') || '';
  const taskDefinition = await getEnv('ECS_TASK_DEFINITION') || '';
  const ecs = new AWS.ECS();
  const params : AWS.ECS.Types.RunTaskRequest = {
      cluster: cluster, 
      taskDefinition: taskDefinition,
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
          environment: [
            {
              name: 'TENANT_NAME',
              value: 'hello'
            },
            {
              name: 'TENANT_DOMAIN_RECORD_VALUE',
              value: 'amplify'
            },
            {
              name: 'TF_BUCKET',
              value: ''
            },
            {
              name: 'TF_BUCKET_KEY',
              value: 'base/backend/tenant_provision/dev/hello/terraform.tfstate'
            }
          ]
        }]
      }
    };
    await ecs.runTask(params).promise();
    res.json({ message: 'hello' });
});

export default app;
