FROM ubuntu:20.04

RUN apt update -y;\
    apt install curl wget zip -y;

# Install aws cli
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip";\
    unzip awscliv2.zip; \
    ./aws/install; \
     aws --version

# Install nodejs
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -; \
    apt -y install nodejs; \
    node -v

# Install terraform
ARG TF_VERSION=1.1.5
RUN curl -s -qL -o terraform_install.zip https://releases.hashicorp.com/terraform/${TF_VERSION}/terraform_${TF_VERSION}_linux_amd64.zip; \
    unzip terraform_install.zip -d /usr/bin/; \
    chmod +x /usr/bin/terraform; \
    terraform -v

ARG FUNCTION_DIR="/var/task"

# Install aws-sdk
RUN mkdir -p ${FUNCTION_DIR}; \
    npm install aws-sdk

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
COPY dist/ ${FUNCTION_DIR}
COPY node_modules ${FUNCTION_DIR}/node_modules
COPY infrastructures ${FUNCTION_DIR}/infrastructures

WORKDIR ${FUNCTION_DIR}

ENV FUNCTION_DIR ${FUNCTION_DIR}

ENTRYPOINT ["/entrypoint.sh"]

