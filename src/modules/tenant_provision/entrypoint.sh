#!/bin/bash

if [ -z ${FUNCTION_DIR} ]; then
  echo "Missing FUNCTION_DIR" >&2
  exit 1
fi
if [ -z ${FUNCTION_HANDLER} ]; then
  echo "Missing FUNCTION_HANDLER" >&2
  exit 1
fi

CUR_DIR=$(pwd)

eval "HANDLER=($(echo ${FUNCTION_HANDLER} | tr "." "\n"))"

# Create index.js
cat << EOF > ${FUNCTION_DIR}/index.js
const app = require("./${HANDLER[0]}")
app.${HANDLER[1]}()
EOF

# Execute js
node ${FUNCTION_DIR}/index.js
# ts-node index.ts