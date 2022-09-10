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
            console.log('Index deleted, skipped creation.');
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
                AS: 'name',
                SORTABLE: true
            },
            '$.type_line': {
                type: SchemaFieldTypes.TEXT,
                AS: 'type_line',
                SORTABLE: true
            },
            '$.set': {
                type: SchemaFieldTypes.TEXT,
                AS: 'set',
                SORTABLE: true
            },
            '$.lang': {
                type: SchemaFieldTypes.TEXT,
                AS: 'lang',
                SORTABLE: true
            },
            '$.set_type': {
                type: SchemaFieldTypes.TEXT,
                AS: 'set_type',
                SORTABLE: true
            }
        }, {
        ON: 'JSON'
    }).finally(() => {
        client.quit();
        return;
    });
}