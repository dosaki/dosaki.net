variable "apex_domain_name" {
  description = "The bare domain that should redirect, e.g. dosaki.net"
}

variable "target_domain_name" {
  description = "The domain visitors are redirected to, over HTTPS"
}

variable "hosted_zone_id" {
  description = "The ID of the hosted zone for the apex domain"
}

variable "cert_arn" {
  description = "ACM certificate (us-east-1) covering the apex domain"
}
