#!/bin/bash
ERROR_LOG=""
ERROR_FILE=error.log
touch ${ERROR_FILE}

if [[ -z ${TF_ENV} ]]; then
  ERROR_LOG="Missing TF_ENV"
fi
if [[ -z ${TENANT_NAME} && -z ${ERROR_LOG} ]]; then
  ERROR_LOG="Missing TENANT_NAME"
fi
if [[ -z ${TENANT_EMAIL} && -z ${ERROR_LOG} ]]; then
  ERROR_LOG="Missing TENANT_EMAIL"
fi
if [[ -z ${TF_BUCKET} && -z ${ERROR_LOG} ]]; then
  ERROR_LOG="Missing TF_BUCKET"
fi
if [[ -z ${TF_BUCKET_KEY} && -z ${ERROR_LOG} ]]; then
  ERROR_LOG="Missing TF_BUCKET_KEY"
fi
if [[ -z ${TENANT_PHONE} && -z ${ERROR_LOG} ]]; then
  ERROR_LOG="Missing TENANT_PHONE"
fi

echo $ERROR_LOG

tenant_provision() {
  TF_PREFIX_COMMAND='terraform -chdir="infrastructures" '
  TF_INIT_COMMAND=${TF_PREFIX_COMMAND}'init -backend-config "bucket='${TF_BUCKET}'" -backend-config "key='${TF_BUCKET_KEY}'" -reconfigure'
  TF_VALIDATE_COMMAND=${TF_PREFIX_COMMAND}'validate'
  TF_PLAN_COMMAND=${TF_PREFIX_COMMAND}'plan -var="TENANT_NAME='${TENANT_NAME}'" -var="ENV='${TF_ENV}'"'
  TF_APPLY_COMMAND=${TF_PREFIX_COMMAND}'apply --auto-approve -var="TENANT_NAME='${TENANT_NAME}'" -var="ENV='${TF_ENV}'"'
  STEP_FUNCTION_TASK_TOKEN=${TASK_TOKEN_ENV_VARIABLE}

  echo ">>>>>>>>> Running command: ${TF_INIT_COMMAND}"
  if eval "${TF_INIT_COMMAND}" 2>&1 | tee ${ERROR_FILE}; then
    echo ">>>>>>>>> Command TF_INIT_COMMAND run success"
  else
    echo ">>>>>>>>> Command TF_INIT_COMMAND run failure"
    ERROR_LOG="Command TF_INIT_COMMAND run failure: "`cat ${ERROR_FILE}`
    return 1
  fi

  echo ">>>>>>>>> Running command: ${TF_VALIDATE_COMMAND}"
  if eval "${TF_VALIDATE_COMMAND}" 2>&1 | tee ${ERROR_FILE}; then
    echo ">>>>>>>>> Command TF_VALIDATE_COMMAND run success"
  else
    echo ">>>>>>>>> Command TF_VALIDATE_COMMAND run failure"
    ERROR_LOG="Command TF_VALIDATE_COMMAND run failure: "`cat ${ERROR_FILE}`
    return 1
  fi

  echo ">>>>>>>>> Running command: ${TF_PLAN_COMMAND}"
  if eval "${TF_PLAN_COMMAND}" 2>&1 | tee ${ERROR_FILE}; then
    echo ">>>>>>>>> Command TF_PLAN_COMMAND run success"
  else
    echo ">>>>>>>>> Command TF_PLAN_COMMAND run failure"
    ERROR_LOG="Command TF_PLAN_COMMAND run failure: "`cat ${ERROR_FILE}`
    return 1
  fi

  echo ">>>>>>>>> Running command: ${TF_APPLY_COMMAND}"
  if eval "${TF_APPLY_COMMAND}" 2>&1 | tee ${ERROR_FILE}; then
    echo ">>>>>>>>> Command TF_APPLY_COMMAND run success"
  else
    echo ">>>>>>>>> Command TF_APPLY_COMMAND run failure"
    ERROR_LOG="Command TF_APPLY_COMMAND run failure: "`cat ${ERROR_FILE}`
    return 1
  fi

  echo "Tenant provision finished"
  return 0
}

PAYLOAD_FMT='{"tenantName": "'${TENANT_NAME}'", "tenantEmail": "'${TENANT_EMAIL}'", "tenantPhone": "'${TENANT_PHONE}'", "result": "%s", "message": "%s"}'
STS="FAIL"
if [[ -z ${ERROR_LOG} ]]; then
  #Allow to save error status when combine command with tee
  set -o pipefail
  tenant_provision
  if [ $? -ne 0 ]; then
    echo "Tenant provision failure"
    ERROR_LOG=`printf "%q" "${ERROR_LOG}"`
    ERROR_LOG=$(sed 's/\"/ /g' <<< ${ERROR_LOG})
    ERROR_LOG=$(sed 's/\\/\\\\/g' <<< ${ERROR_LOG})
    ERROR_LOG=$(sed "s/'//g" <<< ${ERROR_LOG})
    PAYLOAD=`printf "${PAYLOAD_FMT}" "${STS}" "${ERROR_LOG}"`
    POST_INVOKE_COMMAND="aws stepfunctions send-task-failure \
    --task-token ${STEP_FUNCTION_TASK_TOKEN} \
    --cause '"${PAYLOAD}"'"
  else
    echo "Tenant provision finished"
    STS="SUCCESS"
    PAYLOAD=`printf "${PAYLOAD_FMT}" "${STS}"`
    POST_INVOKE_COMMAND="aws stepfunctions send-task-success \
    --task-token ${STEP_FUNCTION_TASK_TOKEN} \
    --task-output  '"${PAYLOAD}"'"
  fi
  set +o pipefail
fi

rm -rf $ERROR_FILE
echo $POST_INVOKE_COMMAND
eval "${POST_INVOKE_COMMAND}"
