import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

export async function updateSecret(name: string, value: string) {
    console.log(
        `THIS IS NOT UPDATING THE SECRET ${name} with value ${value} because the code is commented out`,
    );
    console.log('Please make sure to update it manually if needed.');
    console.log(`Updating secret ${name}...`);

    const [secret] = await client.addSecretVersion({
        parent: name,
        payload: {
            data: Buffer.from(value, 'utf8'),
        },
    });

    console.info(`Updated secret ${secret.name}`);
}
