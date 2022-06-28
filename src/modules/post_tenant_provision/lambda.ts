import * as AWS from 'aws';
import { getAwsSecretValue, getEnv } from 'get-env';
import {
  LANGUAGES_TYPE, ROLES_TYPE, THEMES_TYPE, User,
} from './models/User';
import { dynamoProvider } from './providers';
import {TENANT_INDEX, EMPLOYEE_INDEX, ENABLED, INFORMATION_INDEX } from './utils/constants';
import logger from './utils/logger';

interface SESParams {
  Destination: {
    ToAddresses: string[],
    CcAddresses: string[],
  },
  Message: {
    Body: {
      Text: {
        Charset: 'UTF-8',
        Data: string
      },
    },

    Subject: { Data: string },
  },
  Source: string,
}

interface PostTenantProvisionEvent {
  result: 'SUCCESS' | 'FAIL',
  tenantName: string,
  tenantEmail: string,
  tenantPhone: string,
  message: string
}

const awsRegion = getEnv('AWS_REGION');
const ses = new AWS.SES({ region: awsRegion });

const initializeTenantData = async (event: PostTenantProvisionEvent) => {
  const ddbTable = await getAwsSecretValue('DYNAMO_TRAVEL_TABLE');
  const currentTime = Date.now();

  const tenantTypeLsi = `${TENANT_INDEX}#${ENABLED}`;
  const tenantPK = `${TENANT_INDEX}#${event.tenantName}`;
  // Put the Tenant information to DynamoDB
  await dynamoProvider.putItem(
    ddbTable,
    tenantPK,
    `${TENANT_INDEX}#${INFORMATION_INDEX}`,
    {
      email: event.tenantEmail,
      phone: event.tenantPhone,
      tenant: event.tenantName,
      typeLsi: tenantTypeLsi,
      createdAt: currentTime,
      updatedAt: currentTime,
    },
  );

  const tenantAdminUser: User = {
    username: event.tenantName,
    name: event.tenantName,
    email: event.tenantEmail,
    phoneNumber: event.tenantPhone,
    tenant: event.tenantName,
    role: ROLES_TYPE.ROOT,
    settings: {
      theme: THEMES_TYPE.LIGHT,
      language: LANGUAGES_TYPE.VIETNAMESE,
    },
    createdAt: currentTime,
    updatedAt: currentTime,
  };
  // TODO: Need to be implement more user status to filter
  const employeeTypeLsi = `${EMPLOYEE_INDEX}#${ENABLED}`;
  // Put the Tenant employee information to DynamoDB
  await dynamoProvider.putItem(
    ddbTable,
    tenantPK,
    `${EMPLOYEE_INDEX}#${event.tenantName}`,
    { ...tenantAdminUser, typeLsi: employeeTypeLsi },
  );
};

/**
 * Notify the result of provisioning process to tenant user
 * @param event Lambda event
 * @param tenantDataInitialErrorMessage Error message of tenant initial process if had.
 * @returns
 */
const notifyTenant = async (
  event: PostTenantProvisionEvent,
  tenantDataInitialErrorMessage?: string,
) => {
  const notificationEmail = await getAwsSecretValue('NOTIFICATION_SENDER_EMAIL');
  const adminEmail = await getAwsSecretValue('ADMIN_EMAIL');
  const { tenantName, tenantEmail } = event;

  const params: SESParams = {
    Destination: {
      ToAddresses: [],
      CcAddresses: [],
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: '',
        },
      },
      Subject: { Data: 'Customer Create Notification' },
    },
    Source: notificationEmail,
  };

  if (!tenantDataInitialErrorMessage) {
    // Success: Send notification to customer
    params.Destination.ToAddresses = [tenantEmail];
    params.Destination.CcAddresses = [adminEmail];
    params.Message.Subject.Data = 'Your TravelOffice account created successfully!';
    params.Message.Body.Text.Data = 'Your TravelOffice account created successfully!';
  } else {
    // Fail: Send notification to admin
    params.Destination.ToAddresses = [adminEmail];
    params.Message.Subject.Data = `Tenant [${tenantName}] create failed`;
    params.Message.Body.Text.Data = tenantDataInitialErrorMessage || event.message;
  }

  return ses.sendEmail(params).promise();
};

// eslint-disable-next-line import/prefer-default-export
export const handler = async (event: PostTenantProvisionEvent) => {
  logger.log(`[handler] Receive event ${JSON.stringify(event, null, 2)}`);
  let tenantDataInitialErrorMessage;
  try {
    if (event.result === 'SUCCESS') {
      // Add tenant information to DynamoDB
      await initializeTenantData(event);
    }
  } catch (error: any) {
    logger.log(`[handler] Generated an error ${error}`);
    tenantDataInitialErrorMessage = error.message;
  } finally {
    // Send notification
    await notifyTenant(event, tenantDataInitialErrorMessage);
  }
};
