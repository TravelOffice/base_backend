import * as AWS from 'aws';
import { getAwsSecretValue, getEnv } from 'get-env';
import {
  BASE_ROLES, Role,
} from './data';
import DEFAULT_EMAIL_TEMPLATES from './data/email_templates';
import { LANGUAGES_TYPE, ROLES_TYPE, THEMES_TYPE } from './model/User';
import { dynamoProvider } from './providers';
import {
  EMPLOYEE_INDEX, ENABLED, INFORMATION_INDEX, ROLE_INDEX, TENANT_INDEX,
} from './utils/constants';

const env = getEnv('NODE_ENV');
const clusterArn = getEnv('ECS_CLUSTER_ARN');
const launchType = getEnv('ECS_LAUNCH_TYPE');
const subnet = getEnv('ECS_SUBNET');
const taskDefinitionArn = getEnv('ECS_TASK_DEFINITION_ARN');
const taskDefinitionName = getEnv('ECS_TASK_DEFINITION_NAME');

const initializeTenantRolePermission = (pk: string) => BASE_ROLES.roles.map((role: Role) => {
  let { permissions } = role;
  if (role.extend) {
    const soureRole = BASE_ROLES.roles.find((x) => role.extend?.includes(x.name));
    if (soureRole) {
      permissions = permissions.concat(soureRole.permissions);
      permissions = permissions.filter((item, index) => permissions.indexOf(item) === index);
    }
  }
  return {
    PutRequest: {
      Item: AWS.DynamoDB.Converter.marshall({
        pk,
        sk: `${ROLE_INDEX}#${role.name}`,
        permissions,
      }),
    },
  };
});

const initializeTenantData = (
  pk: string,
  tenantName: string,
  tenantEmail: string,
  tenantPhone: string,
) => {
  const currentTime = Date.now();
  const tenantTypeLsi = `${TENANT_INDEX}#${ENABLED}`;
  const tenantRecord = {
    PutRequest: {
      Item: AWS.DynamoDB.Converter.marshall({
        pk,
        sk: `${TENANT_INDEX}#${INFORMATION_INDEX}`,
        email: tenantEmail,
        phone: tenantPhone,
        tenant: tenantName,
        typeLsi: tenantTypeLsi,
        createdAt: currentTime,
        updatedAt: currentTime,
      }),
    },
  };
  const tenantAdminRecord = {
    PutRequest: {
      Item: AWS.DynamoDB.Converter.marshall({
        pk,
        sk: `${EMPLOYEE_INDEX}#${tenantName}`,
        username: tenantName,
        name: tenantName,
        email: tenantEmail,
        phoneNumber: tenantPhone,
        tenant: tenantName,
        roles: [ROLES_TYPE.ROOT],
        roleStr: `#${ROLES_TYPE.ROOT}#`,
        settings: {
          theme: THEMES_TYPE.LIGHT,
          language: LANGUAGES_TYPE.VIETNAMESE,
        },
        createdAt: currentTime,
        updatedAt: currentTime,
      }),
    },
  };
  const emailTemplate = JSON.stringify(DEFAULT_EMAIL_TEMPLATES)
    .replace(/"toAddresses":\[\]/g, `"toAddresses":["${tenantEmail}"]`)
    .replace(/"ccAddresses":\[\]/g, `"ccAddresses":["${tenantEmail}"]`);
  const emailTemplateRecord = {
    PutRequest: {
      Item: AWS.DynamoDB.Converter.marshall({
        pk,
        sk: 'EMAIL#TEMPLATE',
        ...JSON.parse(emailTemplate),
        createdAt: currentTime,
        updatedAt: currentTime,
      }),
    },
  };

  return [tenantRecord, tenantAdminRecord, emailTemplateRecord];
};

// eslint-disable-next-line import/prefer-default-export
export const handler = async (event: any) => {
  try {
    console.info(`[handler] Received event ${event}`);
    const [tenantName] = event.userName.toLowerCase().split('#');

    // Check tenant information exist or not.
    const tenantDB = await getAwsSecretValue('DYNAMO_TRAVEL_TABLE');
    const tenantPk = `TENANT#${tenantName}`;
    const tenantSk = 'TENANT#INFORMATION';
    const tenantInfo = await dynamoProvider.getItem(tenantDB, tenantPk, tenantSk);
    if (tenantInfo) return event; // Stop if tenant information exist

    // Initialize tenant information
    const tenantPhone = event.request.userAttributes.phone_number;
    const tenantEmail = event.request.userAttributes.email;
    const tfBucket = await getAwsSecretValue('TF_BUCKET');
    const stepFunction = new AWS.StepFunctions({ apiVersion: '2016-11-23' });
    const notificationEmail = `${tenantName}@traveloffice.shop`;
    const adminEmail = await getAwsSecretValue('ADMIN_EMAIL');

    const rolePermissionDB = await getAwsSecretValue('DYNAMO_ROLE_PERMISSION_TABLE');
    const tenantRecord = initializeTenantData(tenantPk, tenantName, tenantEmail, tenantPhone);
    const tenantRolesRecord = initializeTenantRolePermission(tenantPk);
    const batchWriteData: { [key: string]: any } = {};
    batchWriteData[tenantDB] = tenantRecord;
    batchWriteData[rolePermissionDB] = tenantRolesRecord;

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
              AssignPublicIp: 'ENABLED',
            },
          },
          Overrides: {
            ContainerOverrides: {
              Name: taskDefinitionName,
              Environment: {
                TENANT_NAME: tenantName,
                TENANT_EMAIL: adminEmail,
                TENANT_PHONE: tenantPhone,
                TF_BUCKET: tfBucket,
                TF_BUCKET_KEY: `base/backend/tenant_provision/environments/${env}/${tenantName}/terraform.tfstate`,
              },
            },
          },
        },
        initializeTenantData: {
          RequestItems: batchWriteData,
        },
        sendSuccessNotification: {
          Destination: {
            ToAddresses: [tenantEmail],
            CcAddresses: [adminEmail],
          },
          Message: {
            Subject: {
              Data: 'Customer Create Notification',
            },
            Body: {
              Text: {
                Data: 'Your TravelOffice account created successfully',
              },
            },
          },
          Source: notificationEmail,
        },
        sendFailedNotification: {
          Destination: {
            ToAddresses: [tenantEmail],
            CcAddresses: [],
          },
          Message: {
            Subject: {
              Data: `Tenant ${tenantName} create failed`,
            },
            Body: {
              Text: {
                Data: `Tenant ${tenantName} create failed`,
              },
            },
          },
          Source: notificationEmail,
        },
      }),
    };
    console.log(params);
    // Init step function
    await stepFunction.startExecution(params).promise();

    return event;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.messsage);
  }
};
