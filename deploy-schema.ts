import { createClient, SchemaFieldTypes } from 'redis';

main()

async function main() {

    const client = createClient({});
    client.connect();
    client.on('connect', () => console.log('connected to redis successfully!'));
    client.on('error', (err) => console.log('Redis Client Error', err));
    try {
        await client.ft.dropIndex('idx:cards');
    } catch (e) {
        if (e.message === 'Unknown Index name') {
            console.log('Index exists deleted, skipped creation.');
        } else {
            // Something went wrong, perhaps RediSearch isn't installed...
            console.error(e);
            process.exit(1);
        }
    }


    await client.ft.create('idx:cards',
        {
            '$.name': {
                type: SchemaFieldTypes.TEXT,
                AS: 'name'
            },
            '$.type_line': {
                type: SchemaFieldTypes.TEXT,
                AS: 'type_line'
            },
            '$.set': {
                type: SchemaFieldTypes.TEXT,
                AS: 'set'
            }
        }, {
        ON: 'JSON'
    }).finally(() => {
        client.disconnect();
        return;
    });
}