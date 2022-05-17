#!/bin/bash

POSITIONAL_ARGS=()

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-install)
      SKIP_INSTALL="true"
      shift # past argument
      ;;
    -*|--*)
      echo "Unknown option $1"
      exit 1
      ;;
    *)
      POSITIONAL_ARGS+=("$1") # save positional arg
      shift # past argument
      ;;
  esac
done

CUR_DIR=$(pwd)

# Clean up
rm -rf ${CUR_DIR}/deploy

# Lint check
install_module() {
  SERVICENAME=$1
  SERVICE_DIR=${CUR_DIR}/src/modules/${SERVICENAME}
  # Build service
  echo "Run install node module for service ${SERVICENAME}..."
  cd ${SERVICE_DIR}
  if [ ! -f "package.json" ]; then
    echo "Missing requirement package.json file for ${SERVICENAME}!" >&2
    return 1
  fi
  if [ ! -f ".eslintrc.js" ]; then
    echo "Missing requirement eslintrc file for ${SERVICENAME}!" >&2
    return 1
  fi
  rm -rf ${SERVICE_DIR}/dist
  rm -rf ${SERVICE_DIR}/node_modules
  rm -rf ${SERVICE_DIR}/package-lock.json
  npm install
  retVal=$?
  if [ $retVal -ne 0 ]; then
      echo "Service ${SERVICENAME} build failed!"
      exit $retVal
  fi
}

lint_check() {
  SERVICENAME=$1
  SERVICE_DIR=${CUR_DIR}/src/modules/${SERVICENAME}
  # Build service
  echo "Run lint check for service ${SERVICENAME}..."
  cd ${SERVICE_DIR}
  if [ ! -f "package.json" ]; then
    echo "Missing requirement package.json file for ${SERVICENAME}!" >&2
    return 1
  fi
  if [ ! -f ".eslintrc.js" ]; then
    echo "Missing requirement eslintrc file for ${SERVICENAME}!" >&2
    return 1
  fi

  npm run lint
  retVal=$?
  if [ $retVal -ne 0 ]; then
      echo "Service ${SERVICENAME} lint check failed!"
      exit $retVal
  fi
}

cd ${CUR_DIR}/src/modules
MODULES_DIR=$(ls -d */ | cut -f1 -d'/')

if [ "${SKIP_INSTALL}" != "true" ]; then
  for dir in $MODULES_DIR
  do
    install_module ${dir}
  done
fi

echo "Lint checking..."
for dir in $MODULES_DIR
do
  lint_check ${dir}
done

