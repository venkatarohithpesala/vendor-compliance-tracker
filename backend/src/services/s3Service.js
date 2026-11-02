import AWS from "aws-sdk";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as s3GetSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configure AWS SDK
const useLocalStack = process.env.USE_LOCALSTACK === "true";
const localStackEndpoint =
  process.env.LOCALSTACK_ENDPOINT || "http://localhost:4566";

// Configure S3 client
let s3Client;
let s3LegacyClient;

if (useLocalStack) {
  // LocalStack configuration for development
  s3Client = new S3Client({
    region: "us-east-1",
    endpoint: localStackEndpoint,
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test",
    },
    forcePathStyle: true,
  });

  s3LegacyClient = new AWS.S3({
    region: "us-east-1",
    endpoint: localStackEndpoint,
    accessKeyId: "test",
    secretAccessKey: "test",
    s3ForcePathStyle: true,
  });
} else {
  // Production AWS S3 configuration
  s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  s3LegacyClient = new AWS.S3({
    region: process.env.AWS_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
}

const bucketName = process.env.AWS_S3_BUCKET || "ventrack-documents";

// Upload file to S3
export const uploadToS3 = async (fileBuffer, key, mimeType) => {
  try {
    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      // Add metadata for better organization
      Metadata: {
        uploadedAt: new Date().toISOString(),
        originalSize: fileBuffer.length.toString(),
      },
    };

    const command = new PutObjectCommand(uploadParams);
    const result = await s3Client.send(command);

    // Generate public URL
    const publicUrl = useLocalStack
      ? `${localStackEndpoint}/${bucketName}/${key}`
      : `https://${bucketName}.s3.${
          process.env.AWS_REGION || "us-east-1"
        }.amazonaws.com/${key}`;

    return {
      Location: publicUrl,
      ETag: result.ETag,
      Bucket: bucketName,
      Key: key,
    };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

// Delete file from S3
export const deleteFromS3 = async (key) => {
  try {
    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);

    return { success: true };
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
};

// Generate signed URL for secure access
export const getSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const signedUrl = await s3GetSignedUrl(s3Client, command, {
      expiresIn, // Default 1 hour
    });

    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};

// Get file metadata
export const getFileMetadata = async (key) => {
  try {
    const headParams = {
      Bucket: bucketName,
      Key: key,
    };

    const metadata = await s3LegacyClient.headObject(headParams).promise();

    return {
      ContentLength: metadata.ContentLength,
      ContentType: metadata.ContentType,
      LastModified: metadata.LastModified,
      ETag: metadata.ETag,
      Metadata: metadata.Metadata,
    };
  } catch (error) {
    console.error("Error getting file metadata:", error);
    throw new Error(`Failed to get file metadata: ${error.message}`);
  }
};

// List files in a folder/prefix
export const listFiles = async (prefix = "", maxKeys = 1000) => {
  try {
    const listParams = {
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys,
    };

    const data = await s3LegacyClient.listObjectsV2(listParams).promise();

    return {
      files: data.Contents || [],
      isTruncated: data.IsTruncated,
      nextContinuationToken: data.NextContinuationToken,
    };
  } catch (error) {
    console.error("Error listing files:", error);
    throw new Error(`Failed to list files: ${error.message}`);
  }
};

// Copy file within S3
export const copyFile = async (sourceKey, destinationKey) => {
  try {
    const copyParams = {
      Bucket: bucketName,
      CopySource: `/${bucketName}/${sourceKey}`,
      Key: destinationKey,
    };

    await s3LegacyClient.copyObject(copyParams).promise();

    return { success: true };
  } catch (error) {
    console.error("Error copying file:", error);
    throw new Error(`Failed to copy file: ${error.message}`);
  }
};

// Check if bucket exists and create if needed (development only)
export const ensureBucketExists = async () => {
  try {
    if (useLocalStack) {
      // For LocalStack, try to create bucket if it doesn't exist
      const createParams = {
        Bucket: bucketName,
      };

      try {
        await s3LegacyClient.createBucket(createParams).promise();
        console.log(
          `LocalStack bucket '${bucketName}' created or already exists`
        );
      } catch (error) {
        if (error.code !== "BucketAlreadyExists") {
          console.warn("Error creating LocalStack bucket:", error.message);
        }
      }
    }
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
  }
};

export { s3Client, s3LegacyClient, bucketName };
