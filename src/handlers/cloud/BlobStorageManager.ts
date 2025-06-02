import { Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { Stream } from 'stream';

@Injectable()
export default class BlobStorageManager {
    private readonly bucketName = process.env.BLOB_STORAGE_BUCKET_NAME;
    private readonly storage = new Storage();

    async read(path: string): Promise<Buffer> {
        const contents = await this.storage
            .bucket(this.bucketName)
            .file(path)
            .download();

        return Buffer.from(contents.toString(), 'binary');
    }

    async write(path: string, file: Buffer): Promise<void> {
        const passthroughStream = new Stream.PassThrough();
        passthroughStream.write(file);
        passthroughStream.end();

        const writeStream = this.storage
            .bucket(this.bucketName)
            .file(path)
            .createWriteStream();

        await new Promise<void>((resolve) => {
            passthroughStream
                .pipe(writeStream)
                .on('finish', () => {
                    resolve();
                })
                .on('error', (err) => {
                    console.log(
                        'Error while trying to write file to cloud storage',
                        err,
                    );
                    throw new Error();
                });
        });
    }
}
