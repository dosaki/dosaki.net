resource "aws_s3_bucket" "static_site" {
  bucket = var.domain_name
}

resource "aws_s3_bucket_ownership_controls" "static_site_ownership_controls" {
  bucket = aws_s3_bucket.static_site.id
  rule {
    object_ownership = "ObjectWriter"
  }
}

resource "aws_s3_bucket_public_access_block" "static_site_public_access_block" {
  bucket = aws_s3_bucket.static_site.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "static_site_acl" {
  depends_on = [
    aws_s3_bucket_ownership_controls.static_site_ownership_controls,
    aws_s3_bucket_public_access_block.static_site_public_access_block
  ]

  bucket = aws_s3_bucket.static_site.id
  acl    = "public-read"
}

resource "aws_s3_bucket_website_configuration" "static_site_config" {
  bucket = aws_s3_bucket.static_site.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}


locals {
  # index.html names the hashed bundles of the current build, and those of the
  # previous build are deleted on apply. It must never be served stale, or
  # browsers request chunks that no longer exist. Hashed files under assets/
  # never change content under the same name, so they can be cached forever.
  cache_control_index  = "no-cache"
  cache_control_hashed = "public, max-age=31536000, immutable"
  cache_control_other  = "public, max-age=3600"
}

resource "aws_s3_object" "static_site_content" {
  for_each     = var.website_dir_module.files
  depends_on   = [aws_s3_bucket_acl.static_site_acl]
  bucket       = aws_s3_bucket.static_site.bucket
  key          = each.key
  source       = each.value.source_path
  content_type = each.value.content_type
  acl          = "public-read"
  etag         = each.value.digests.md5
  cache_control = (
    each.key == "index.html" ? local.cache_control_index :
    startswith(each.key, "assets/") ? local.cache_control_hashed :
    local.cache_control_other
  )
}