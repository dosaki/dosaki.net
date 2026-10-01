# Read by the deploy workflow to invalidate the CloudFront cache after apply.
output "distribution_id" {
  value = module.cloudfront.distribution_id
}
