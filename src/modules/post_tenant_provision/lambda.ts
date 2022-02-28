import { getAwsSecretValue, getEnv } from 'get-env';
import * as AWS from 'aws';

// eslint-disable-next-line import/prefer-default-export
export const handler = async (event: any, context: any) => {
  console.log(event);
  const status:boolean = (event.success === 'true');
  const awsRegion = await getEnv('AWS_REGION');
  const notificationEmail = (await getAwsSecretValue('NOTIFICATION_SENDER_EMAIL'))!;
  const adminEmail = (await getAwsSecretValue('ADMIN_EMAIL'))!;
  const tenantName = event.tenantName!;
  const tenantEmail = event.tenantEmail!;
  const ses = new AWS.SES({ region: awsRegion });
  interface Params {
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
  const params : Params = {
    Destination: {
      ToAddresses: [],
      CcAddresses: [],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: ""
        },
      },
      Subject: { Data: "Customer Create Notification" },
    },
    Source: notificationEmail,
  };

  if (status) {
    // Success: Send notification to customer
    params.Destination.ToAddresses = [ tenantEmail ];
    params.Destination.CcAddresses = [ adminEmail ];
    params.Message.Subject.Data = "Your TravelOffice account created successfully!"
    params.Message.Body.Text.Data = "Your TravelOffice account created successfully!"
  } else {
    // Fail: Send notification to admin
    params.Destination.ToAddresses = [ adminEmail ];
    params.Message.Body.Text.Data = event.message
    params.Message.Subject.Data = "Tenant [" + tenantName + "] create failed"
  }
 
  return ses.sendEmail(params).promise();
};
