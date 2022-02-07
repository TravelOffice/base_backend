#!/bin/bash

CUR_DIR=$(pwd)
ZIP_FILE=$1
ZIP_SOURCE=$2
ZIP_DIR=$(dirname $ZIP_FILE)

mkdir -p ${ZIP_DIR}
# rm -rf ${ZIP_FILE}

cd ${ZIP_SOURCE}
zip -rqX ${CUR_DIR}/${ZIP_FILE} ./*
cd ${CUR_DIR}

echo "{ \"path\": \"${ZIP_FILE}\", \"hash\": \"$(cat "$ZIP_FILE" | shasum -a 256 | cut -d " " -f 1 | xxd -r -p | base64)\", \"md5\": \"$(md5sum $ZIP_FILE | cut -d ' ' -f 1)\" }"
