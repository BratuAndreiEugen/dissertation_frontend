output "website_url" {
  description = "The live secure URL of your dashboard hosting platform"
  value       = "https://${aws_cloudfront_distribution.cdn.domain_name}"
}

output "bucket_name" {
  description = "Name of the deployment target S3 bucket"
  value       = aws_s3_bucket.website_bucket.id
}