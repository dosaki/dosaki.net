variable "region" {
  default = "eu-west-1"
}

variable "profile" {
  default = "production"
}

variable "domain_name" {
  description = "The domain name for the website - this will be used to create a public bucket with the exact same name"
  default = "about.dosaki.net"
}

variable "content_path" {
  description = "The path to the built website content (should have index.html inside)"
  default = "../build"
}

variable "hosted_zone_id" {
  default = "Z09121021LFWFUARXHIR2"
}

variable "cert_arn" {
  default = "ARN for the certificate ARN - See AWS Certificate Manager"
}
