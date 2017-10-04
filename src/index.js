const s3 = require('s3');
const AWS = require('aws-sdk');

module.exports = {
    uploadFile: (filePath, s3Configs, options = {}) => {
        const awsS3Client = new AWS.S3({
            region: s3Configs.region,
            signatureVersion: s3Configs.signatureVersion || 'v4',
            accessKeyId: s3Configs.accessKeyId,
            secretAccessKey: s3Configs.secretAccessKey,
        });

        const client = s3.createClient({
            s3Client: awsS3Client,
            maxAsyncS3: options.maxAsyncS3 || 20,
            s3RetryCount: options.s3RetryCount || 3,
            s3RetryDelay: options.s3RetryDelay || 1000,
            multipartUploadThreshold: options.multipartUploadThreshold || 20971520,
            multipartUploadSize: options.multipartUploadSize || 15728640,
            s3Options: {
                accessKeyId: s3Configs.accessKeyId,
                secretAccessKey: s3Configs.secretAccessKey,
                region: s3Configs.region
            }
        });

        const params = {
            localFile: filePath,
            s3Params: {
                Bucket: s3Configs.bucket,
                Key: options.saveAs || filePath.split('/').pop(),
            }
        };

        return new Promise((resolve, reject) => {
            const uploader = client.uploadFile(params);

            uploader.on('error', (err) => {
                reject(err);
            });

            uploader.on('end', (data) => {
                resolve(data);
            });
        });
    }
}