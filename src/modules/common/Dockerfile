# Build image for tenant provision service

FROM ubuntu:22.04

RUN apt update -y; \
    apt install -y curl wget unzip; \
    curl -sL https://deb.nodesource.com/setup_16.x | bash -; \
    apt -y install nodejs; \
    wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | tee /usr/share/keyrings/hashicorp-archive-keyring.gpg; \
    echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list; \
    apt update -y && apt install terraform -y; \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"; \
    unzip awscliv2.zip; \
    ./aws/install;

RUN node -v; \
    terraform -v; \
    aws --version;