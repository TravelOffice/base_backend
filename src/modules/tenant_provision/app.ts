import AWS from 'aws-sdk';
import utils from 'util';
import child_process from 'child_process';

const exec = utils.promisify(child_process.exec);

async function execWithPromise(command: string) {
  const { stdout, stderr } = await exec(command);
  if (stderr) {
    throw new Error(stderr);
  }
  return stdout;
}

exports.handler = async () => {
  const TENANT_NAME = 'hello';
  const TENANT_DOMAIN_RECORD_VALUE = "10.10.10.10"
  const TF_BUCKET = 'terraform-state20220108143755951900000001';
  const TF_BUCKET_KEY = 'base/backend/tenant_provision/dev/' + TENANT_NAME + '/terraform.tfstate';
  const TF_PREFIX_COMMAND = 'terraform -chdir="./infrastructures" '

  const TF_INIT_COMMAND = TF_PREFIX_COMMAND + 'init -backend-config "bucket=' + TF_BUCKET + '" -backend-config "key=' + TF_BUCKET_KEY + '" -reconfigure'
  const TF_VALIDATE_COMMAND = TF_PREFIX_COMMAND + 'validate'
  const TF_PLAN_COMMAND = TF_PREFIX_COMMAND + 'plan -var="TENANT_NAME=' + TENANT_NAME + '" -var="TENANT_DOMAIN_RECORD_VALUE=' + TENANT_DOMAIN_RECORD_VALUE + '"'
  const TF_APPLY_COMMAND = TF_PREFIX_COMMAND + 'apply --auto-approve -var="TENANT_NAME=' + TENANT_NAME + '" -var="TENANT_DOMAIN_RECORD_VALUE=' + TENANT_DOMAIN_RECORD_VALUE + '"'

  try {
    const initOutput = await execWithPromise(TF_INIT_COMMAND);
    console.log(initOutput);

    const validateOutput = await execWithPromise(TF_VALIDATE_COMMAND);
    console.log(validateOutput);

    const planOutput = await execWithPromise(TF_PLAN_COMMAND);
    console.log(planOutput);

    const applyOutput = await execWithPromise(TF_APPLY_COMMAND);
    console.log(applyOutput);
  } catch (error: any) {
    console.log(error.message);
  }
}
