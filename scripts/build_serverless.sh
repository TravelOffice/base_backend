#!/bin/bash
if [ "$#" -lt 1 ]; then
  echo "Usage: $0 ENVIRONMENTNAME[ 'dev' | 'prod' ]" >&2
  exit 1
fi

CUR_DIR=$(pwd)
ENV=${1}

if [ "${ENV}" != "dev" ] && [ "${ENV}" != "prod" ]; then
  echo "Usage: $0 ENVIRONMENTNAME[ 'dev' | 'prod' ]" >&2
  exit 1
fi

# Clean up
rm -rf ${CUR_DIR}/deploy

# Build dependencies
echo "Building dependencies"
cd ${CUR_DIR}
./scripts/build_dependencies.sh

# Build services and layers
echo "Building services..."
build_service() {
  SERVICENAME=$1
  SERVICE_DIR=${CUR_DIR}/src/modules/${SERVICENAME}
  # Build service
  echo "Build service ${SERVICENAME}..."
  cd ${SERVICE_DIR}
  if [ ! -f "package.json" ]; then
    echo "Missing requirement for ${ENV}!" >&2
    return 1
  fi
  rm -rf ${SERVICE_DIR}/dist
  rm -rf ${SERVICE_DIR}/node_modules
  rm -rf ${SERVICE_DIR}/package-lock.json
  npm install
  echo "Install successfully"
  npm run build
  echo "Build"

  rm -rf ${SERVICE_DIR}/node_modules
  rm -rf ${SERVICE_DIR}/package-lock.json
  echo "Install production dependencies"
  npm install --production
  echo "Finished installing production"
  LAYER_DIR=${CUR_DIR}/src/layers/${SERVICENAME}/nodejs
  mkdir -p ${LAYER_DIR}
  cd ${LAYER_DIR}
  rm -rf *
  echo "Prepare link ${LAYER_DIR}"
  ln -sf ../../../modules/${SERVICENAME}/node_modules .
  echo "Link layer successfully"
  cd $CUR_DIR
}

cd ${CUR_DIR}/src/modules
MODULES_DIR=$(ls -d */ | cut -f1 -d'/')
for dir in $MODULES_DIR
do
  build_service ${dir}
done

# Clean aws-sdk
cd ${CUR_DIR}/src/libs/aws-sdk
rm -rf node_modules
npm install --production
