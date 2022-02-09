terraform {
  backend "s3" {
    encrypt = true
    region  = "ap-southeast-1"
  }
}

provider "aws" {
  region = "ap-southeast-1"
}
