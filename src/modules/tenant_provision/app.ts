import AWS from 'aws-sdk';
import CHILD_PROCESS from 'child_process';

exports.handler = async () => {
  const TENANT_NAME = 'hello';
  const TENANT_DOMAIN_RECORD_VALUE = "10.10.10.10"
  const TF_BUCKET = 'terraform-state20220108143755951900000001';
  const TF_BUCKET_KEY= 'base/backend/tenant_provision/dev/' + TENANT_NAME + '/terraform.tfstate';
  const TF_PREFIX_COMMAND = 'terraform -chdir="./infrastructures" '

  const TF_INIT_COMMAND = TF_PREFIX_COMMAND +'init -backend-config "bucket=' + TF_BUCKET + '" -backend-config "key=' + TF_BUCKET_KEY + '" -reconfigure'
  const TF_VALIDATE_COMMAND = TF_PREFIX_COMMAND + 'validate'
  const TF_PLAN_COMMAND = TF_PREFIX_COMMAND + 'plan -var="TENANT_NAME=' + TENANT_NAME + '" -var="TENANT_DOMAIN_RECORD_VALUE=' + TENANT_DOMAIN_RECORD_VALUE + '"'
  const TF_APPLY_COMMAND = TF_PREFIX_COMMAND + 'apply --auto-approve -var="TENANT_NAME=' + TENANT_NAME + '" -var="TENANT_DOMAIN_RECORD_VALUE=' + TENANT_DOMAIN_RECORD_VALUE + '"'

  CHILD_PROCESS.exec(TF_INIT_COMMAND, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);

    CHILD_PROCESS.exec(TF_VALIDATE_COMMAND, (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);

      CHILD_PROCESS.exec(TF_PLAN_COMMAND, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        CHILD_PROCESS.exec(TF_APPLY_COMMAND, (error, stdout, stderr) => {
          if (error) {
              console.log(`error: ${error.message}`);
              return;
          }
          if (stderr) {
              console.log(`stderr: ${stderr}`);
              return;
          }
          console.log(`stdout: ${stdout}`);
        });
      });
    });
  });
}