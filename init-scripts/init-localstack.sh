#!/bin/bash

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be ready..."
while ! curl -s http://localhost:4566/_localstack/health | grep -q '"s3": "available"'; do
  echo "Waiting for S3 service..."
  sleep 2
done

echo "LocalStack S3 is ready. Setting up buckets..."

# Create S3 bucket for document storage
awslocal s3 mb s3://ventrack-documents

# Set bucket policy for public read access (for development only)
awslocal s3api put-bucket-policy --bucket ventrack-documents --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ventrack-documents/*"
    }
  ]
}'

# Create bucket versioning (optional)
awslocal s3api put-bucket-versioning --bucket ventrack-documents --versioning-configuration Status=Enabled

echo "S3 bucket 'ventrack-documents' created successfully!"
echo "LocalStack setup complete."