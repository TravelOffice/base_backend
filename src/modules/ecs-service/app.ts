import cors from 'cors';
import express, { Request, Response } from 'express';
import { getEnv } from 'get-env';
import compression from 'compression';
import AWS from 'aws-sdk';

const app = express();

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/ecs/tasks', async (req: Request, res: Response) => {
  const env = await getEnv('NODE_ENV');
  const cluster = await getEnv('CLUSTER');
  const launchType = await getEnv('FARGATE');
  const subnet = await getEnv('SUBNET');
  const taskDefinition = await getEnv('taskDefinition');
  const ecs = new AWS.ECS();
  const params = {
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
      }
    };
    await ecs.runTask(params).promise();
    res.json({ message: 'hello' });
});

export default app;
