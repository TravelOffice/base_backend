import * as AWS from 'aws';
import * as fs from 'fs';
import { getAwsSecretValue, getEnv } from 'get-env';
import { BASE_ROLES, Permisison, Role } from './data';
import { dynamoProvider } from './providers';

const env = getEnv('NODE_ENV');
const clusterName = getEnv('ECS_CLUSTER_NAME');
const clusterArn = getEnv('ECS_CLUSTER_ARN');
const launchType = getEnv('ECS_LAUNCH_TYPE');
const subnet = getEnv('ECS_SUBNET');
const taskDefinitionArn = getEnv('ECS_TASK_DEFINITION_ARN');
const taskDefinitionName = getEnv('ECS_TASK_DEFINITION_NAME');

// eslint-disable-next-line import/prefer-default-export
export const handler = async (event: any, context: any) => {
  try {
    console.info(`[handler] Received event ${event}`);
    const [tenantName] = event.userName.toLowerCase().split('#');
  
    // Check tenant information exist or not.
    const dynamoDB = await getAwsSecretValue('DYNAMO_TRAVEL_TABLE');
    const tenantPk = `TENANT#${tenantName}`;
    const tenantSk = `TENANT#INFORMATION`;
    const tenantInfo = await dynamoProvider.getItem(dynamoDB, tenantPk, tenantSk);
    if (tenantInfo) return event; // Stop if tenant information exist
  
    // Initialize tenant information
    const rolePermissionDB = await getAwsSecretValue('DYNAMO_ROLE_PERMISSION_TABLE');
    const baseRoles = BASE_ROLES.roles.map((role: any) => {
      let permissions: Array<Permisison> = role.permissions;
      if (role.extend) {
        const soureRole = BASE_ROLES.roles.find((x) => x.name === role.extend);
        if (soureRole) {
          permissions = permissions.concat(soureRole.permissions);
          permissions = permissions.filter((item, index) => permissions.indexOf(item) === index);
        }
      }
      return {
          "PutRequest": {
              "Item": AWS.DynamoDB.Converter.marshall({
                  "pk": tenantPk,
                  "sk": `ROLE#${role.name}`,
                  "permissions": permissions
              })
          }
      }
    })
    let batchWriteData = Object.assign({});
    batchWriteData[rolePermissionDB] = baseRoles;
  
    // Start provisioning process
    const tenantPhone = event.request.userAttributes.phone_number;
    const tenantEmail = event.request.userAttributes.email;
    const tfBucket = await getAwsSecretValue('TF_BUCKET');
    const stepFunction = new AWS.StepFunctions({ apiVersion: '2016-11-23' });
    const notificationEmail = await getAwsSecretValue('NOTIFICATION_SENDER_EMAIL');
    const adminEmail = await getAwsSecretValue('ADMIN_EMAIL');
  
    const params = {
      stateMachineArn: getEnv('STATE_MACHINE_ARN'),
      input: JSON.stringify({
        tenantProvisionEcsTask: {
          Cluster: clusterArn,
          TaskDefinition: taskDefinitionArn,
          LaunchType: launchType,
          Count: 1,
          PlatformVersion: 'LATEST',
          NetworkConfiguration: {
            AwsvpcConfiguration: {
              Subnets: [subnet],
              AssignPublicIp: 'ENABLED'
            }
          },
          Overrides: {
            ContainerOverrides: {
              Name: taskDefinitionName,
              Environment: {
                TENANT_NAME: tenantName,
                TENANT_EMAIL: adminEmail,
                TENANT_PHONE: tenantPhone,
                TF_BUCKET: tfBucket,
                TF_BUCKET_KEY: 'base/backend/tenant_provision/environments/' + env + '/' + tenantName + '/terraform.tfstate'
              }
            }
          }
        },
        initializeTenantData: {
          RequestItems: batchWriteData
        },
        sendSuccessNotification: {
          Destination: {
            ToAddresses: [tenantEmail],
            CcAddresses: [adminEmail],
          },
          Message: {
            Subject: {
              Data: 'Customer Create Notification'
            },
            Body: {
              Text: {
                Data: 'Your TravelOffice account created successfully'
              }
            }
          },
          Source: notificationEmail
        },
        sendFailedNotification: {
          Destination: {
            ToAddresses: [tenantEmail],
            CcAddresses: [],
          },
          Message: {
            Subject: {
              Data: `Tenant ${tenantName} create failed`
            },
            Body: {
              Text: {
                Data: `Tenant ${tenantName} create failed`
              }
            }
          },
          Source: notificationEmail
        }
      }),
    }
    console.log(params);
    // Init step function 
    await stepFunction.startExecution(params).promise();
  
    return event;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.messsage);
  }
};
