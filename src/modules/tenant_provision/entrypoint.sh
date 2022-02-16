#!/bin/bash
if [ -z ${TENANT_NAME} ]; then
  echo "Missing TENANT_NAME" >&2
  exit 1
fi
if [ -z ${TENANT_DOMAIN_RECORD_VALUE} ]; then
  echo "Missing TENANT_DOMAIN_RECORD_VALUE" >&2
  exit 1
fi
if [ -z ${TF_BUCKET} ]; then
  echo "Missing TF_BUCKET" >&2
  exit 1
fi
if [ -z ${TF_BUCKET_KEY} ]; then
  echo "Missing TF_BUCKET_KEY" >&2
  exit 1
fi

tenant_provision() {
  TF_PREFIX_COMMAND='terraform -chdir="infrastructures" '
  TF_INIT_COMMAND=${TF_PREFIX_COMMAND}'init -backend-config "bucket='${TF_BUCKET}'" -backend-config "key='${TF_BUCKET_KEY}'" -reconfigure'
  TF_VALIDATE_COMMAND=${TF_PREFIX_COMMAND}'validate'
  TF_PLAN_COMMAND=${TF_PREFIX_COMMAND}'plan -var="TENANT_NAME='${TENANT_NAME}'" -var="TENANT_DOMAIN_RECORD_VALUE='${TENANT_DOMAIN_RECORD_VALUE}'"'
  TF_APPLY_COMMAND=${TF_PREFIX_COMMAND}'apply --auto-approve -var="TENANT_NAME='${TENANT_NAME}'" -var="TENANT_DOMAIN_RECORD_VALUE='${TENANT_DOMAIN_RECORD_VALUE}'"'

  echo ">>>>>>>>> Running command: ${TF_INIT_COMMAND}"
  if eval "${TF_INIT_COMMAND}"; then
    echo ">>>>>>>>> Command run success"
  else
    echo ">>>>>>>>> Command run failure"
    return 1
  fi

  echo ">>>>>>>>> Running command: ${TF_VALIDATE_COMMAND}"
  if eval "${TF_VALIDATE_COMMAND}"; then
    echo ">>>>>>>>> Command run success"
  else
    echo ">>>>>>>>> Command run failure"
    return 1
  fi

  echo ">>>>>>>>> Running command: ${TF_PLAN_COMMAND}"
  if eval "${TF_PLAN_COMMAND}"; then
    echo ">>>>>>>>> Command run success"
  else
    echo ">>>>>>>>> Command run failure"
    return 1
  fi

  echo ">>>>>>>>> Running command: ${TF_APPLY_COMMAND}"
  if eval "${TF_APPLY_COMMAND}"; then
    echo ">>>>>>>>> Command run success"
  else
    echo ">>>>>>>>> Command run failure"
    return 1
  fi

  echo "Tenant provision finished"
  return 0
}

tenant_provision
if [ $? -ne 0 ]; then
  echo "Tenant provision failure"
fi

echo "[TBD] Tenant provision finished, go to invoke post provision lambda"
