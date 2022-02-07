CUR_DIR=$(pwd)
echo "Building dependencies..."
DEPENDENCIES_DIR=${CUR_DIR}/src/libs
cd ${DEPENDENCIES_DIR}
LIBS_DIR=$(ls -d */ | cut -f1 -d'/')
for dir in ${LIBS_DIR}
do
  echo "Building dependency ${dir}..."
  echo ${DEPENDENCIES_DIR}/${dir}
  cd ${DEPENDENCIES_DIR}/${dir}
  rm -rf node_modules
  npm install
  npm run build
done
cd ${CUR_DIR}