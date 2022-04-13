import * as AWS from 'aws';
import { getAwsSecretValue, getEnv } from 'get-env';
import { dynamoProvider } from './providers';

interface SESParams {
  Destination: {
    ToAddresses: string[],
    CcAddresses: string[],
  },
  Message: {
    Body: {
      Text: {
        Charset: "UTF-8",
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

// eslint-disable-next-line import/prefer-default-export
export const handler = async (event: PostTenantProvisionEvent) => {
  console.info(`[handler] Receive event ${event}`);
  let tenantDataInitialErrorMessage;
  try {
    if (event.result === 'SUCCESS') {
      // Add tenant information to DynamoDB
      await initializeTenantData(event);
    }
  } catch (error: any) {
    console.info(`[handler] Generated an error ${error}`);
    tenantDataInitialErrorMessage = error.message;
  } finally {
    // Send notification
    await notifyTenant(event, tenantDataInitialErrorMessage);
  }
};

const initializeTenantData = async (event: PostTenantProvisionEvent) => {
  const ddbTable = await getAwsSecretValue('DYNAMO_TRAVEL_TABLE');
  dynamoProvider.putItem(ddbTable, `Tenant#${event.tenantName}`, `Tenant#${event.tenantName}`, {
    email: event.tenantEmail,
    phone: event.tenantPhone
  });
};

/**
 * Notify the result of provisioning process to tenant user
 * @param event Lambda event
 * @param tenantDataInitialErrorMessage Error message of tenant initial process if have.
 * @returns
 */
const notifyTenant = async (event: PostTenantProvisionEvent, tenantDataInitialErrorMessage?: string) => {
  const notificationEmail = await getAwsSecretValue('NOTIFICATION_SENDER_EMAIL');
  const adminEmail = await getAwsSecretValue('ADMIN_EMAIL');
  const tenantName = event.tenantName;
  const tenantEmail = event.tenantEmail;

  const params: SESParams = {
    Destination: {
      ToAddresses: [],
      CcAddresses: [],
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: ''
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
