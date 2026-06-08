### Test Reports for Serverless Function Benchmarking

`npm run dev` in **app** folder to run locally.
`terraform apply` in the **terraform** folder to deploy infrastructure.
`npm run build` -> `aws s3 sync dist/ s3://telemetry-benchmark-dashboard-storage --delete` -> `aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/*"` to deploy frontend app and invalidate caches. SSO Login required as prerequisite. Run `aws sso login`.