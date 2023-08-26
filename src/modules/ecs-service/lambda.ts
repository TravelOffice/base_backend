import * as AWS from 'aws';
import { getAwsSecretValue, getEnv } from 'get-env';
import DEFAULT_EMAIL_TEMPLATES from './data/email_templates';
import { LANGUAGES_TYPE, ROLES_TYPE, THEMES_TYPE } from './model/User';
import { dynamoProvider } from './providers';
import {
  EMPLOYEE_INDEX, ENABLED, INFORMATION_INDEX, TENANT_INDEX,
} from './utils/constants';

const env = getEnv('NODE_ENV');
const clusterArn = getEnv('ECS_CLUSTER_ARN');
const launchType = getEnv('ECS_LAUNCH_TYPE');
const subnet = getEnv('ECS_SUBNET');
const taskDefinitionArn = getEnv('ECS_TASK_DEFINITION_ARN');
const taskDefinitionName = getEnv('ECS_TASK_DEFINITION_NAME');

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
  const tenantRootRecord = {
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

  return [tenantRecord, tenantRootRecord, emailTemplateRecord];
};

const initializeTenantMarketplaceData = (
  tenantName: string,
  tenantEmail: string,
  tenantPhone: string,
) => {
  const currentTime = Date.now();
  const marketplaceRootRecord = {
    PutRequest: {
      Item:
        {
          ...AWS.DynamoDB.Converter.marshall({
            pk: 'USR',
            sk: `${tenantName}#root`,
            organization: tenantName,
            username: 'root',
            id: `${tenantName}#root`,
            name: 'root',
            email: tenantEmail,
            phone: tenantPhone,
            roles: [ROLES_TYPE.ROOT],
            roleStr: `#${ROLES_TYPE.ROOT}#`,
            settings: {
              theme: THEMES_TYPE.LIGHT,
              language: LANGUAGES_TYPE.VIETNAMESE,
            },
            createdAt: currentTime,
            updatedAt: currentTime,
          }),
          enabled: {
            Bool: true,
          },
        },
    },
  };
  return [marketplaceRootRecord];
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
    const domainName = await getAwsSecretValue('DOMAIN_NAME');
    const notificationEmail = `no-reply@${domainName}`;
    const adminEmail = await getAwsSecretValue('ADMIN_EMAIL');

    const tenantRecord = initializeTenantData(tenantPk, tenantName, tenantEmail, tenantPhone);

    // Retrieve data for marketplace record
    const marketplaceDB = await getAwsSecretValue('DYNAMO_MARKETPLACE_TABLE');
    const tenantMarketplaceRecord = initializeTenantMarketplaceData(
      tenantName,
      tenantEmail,
      tenantPhone,
    );

    const batchWriteData: { [key: string]: any } = {};
    batchWriteData[tenantDB] = tenantRecord;
    batchWriteData[marketplaceDB] = tenantMarketplaceRecord;

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
            BccAddresses: [adminEmail],
          },
          Message: {
            Subject: {
              Data: 'Link xác thực tài khoản TravelOffice',
            },
            Body: {
              Html: {
                Charset: 'UTF-8',
                Data: `<p>Vui lòng truy cập vào đường link này để Đăng nhập và Đổi mật khẩu: https://${tenantName}.${domainName}</p><p>Cần hỗ trợ liên hệ qua e-mail: info@itab.com.vn</p>`,
              },
            },
          },
          Source: notificationEmail,
        },
        sendFailedNotification: {
          Destination: {
            ToAddresses: [tenantEmail],
            BccAddresses: [adminEmail],
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
    // Init step function
    await stepFunction.startExecution(params).promise();

    return event;
  } catch (error: any) {
    throw new Error(error.messsage);
  }
};
