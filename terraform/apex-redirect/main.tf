# Redirects http(s)://<apex> to https://<target>. A CloudFront Function answers
# every request itself, so the origin below is only there because CloudFront
# requires one.

resource "aws_cloudfront_function" "redirect" {
  name    = "${replace(var.apex_domain_name, ".", "-")}-apex-redirect"
  runtime = "cloudfront-js-2.0"
  comment = "301 ${var.apex_domain_name} to https://${var.target_domain_name}"
  publish = true
  code    = templatefile("${path.module}/redirect.js", { target_domain = var.target_domain_name })
}

resource "aws_cloudfront_distribution" "redirect" {
  enabled         = true
  is_ipv6_enabled = true
  aliases         = [var.apex_domain_name]
  comment         = "Redirects ${var.apex_domain_name} to ${var.target_domain_name}"
  price_class     = "PriceClass_100"

  origin {
    domain_name = var.target_domain_name
    origin_id   = "unused"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "unused"

    # allow-all rather than redirect-to-https: the function answers plain HTTP
    # too, so http://<apex> reaches the target in one hop instead of two.
    viewer_protocol_policy = "allow-all"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.redirect.arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.cert_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_route53_record" "apex" {
  zone_id = var.hosted_zone_id
  name    = var.apex_domain_name
  type    = "A"

  # The apex already has a hand-made A record (a dead server); take it over.
  allow_overwrite = true

  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}
