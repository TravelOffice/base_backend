import { getAwsSecretValue, getEnv } from 'get-env';
import * as AWS from 'aws';

// eslint-disable-next-line import/prefer-default-export
export const handler = async (event: any, context: any) => {
  console.log(event);
  const status:boolean = (event.success === 'true');
  const notificationEmail = getEnv('NOTIFICATION_EMAIL');
  const adminEmail:string = getEnv('ADMIN_EMAIL');
  const tenantName:string = event.tenantName;
  const tenantEmail:string = event.tenantEmail;
  const ses = new AWS.SES();
  interface Params {
    Destination: {
      ToAddresses: string[],
      CcAddresses: string[],
    },
    Message: {
      Body: {
        Text: string,
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
        Text: "",
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
  } else {
    // Fail: Send notification to admin
    params.Destination.ToAddresses = [ adminEmail ];
    params.Message.Body.Text = event.message
    params.Message.Subject.Data = "Tenant [" + tenantName + "] create failed"
  }
 
  ses.sendEmail(params).promise()

  const response = {
    statusCode: 200,
  };
  return response;
};
