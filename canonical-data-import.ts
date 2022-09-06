
import fetch from 'make-fetch-happen'
import streamarray from 'stream-json/streamers/StreamArray.js'
import Batch from 'stream-json/utils/Batch.js'
import chain from 'stream-chain'
import redis from 'redis'

main()

async function main() {
    const bulk_data_req = await fetch('https://api.scryfall.com/bulk-data', { cachePath: './cache', cache: 'force-cache' })

    const bulk_data = await bulk_data_req.json()
    const bulk_data_uri = bulk_data['data'][3]['download_uri']

    const all_cards_request = await fetch(bulk_data_uri, { cachePath: './cache', cache: 'force-cache' })

    // const pipeline = all_cards_request.body.pipe(streamarray.withParser());

    const pipeline = chain.chain([all_cards_request.body.pipe(streamarray.withParser()), new Batch({ batchSize: 1000 })])

    // const pipeline = chain([ fs.createReadStream('sample.json'), StreamArray.withParser(), new Batch({batchSize: 100}) ]);
    const client = redis.createClient({});
    await client.connect().then(() => {
        client.on('connect', () => console.log('connected to redis successfully!'));
        client.on('error', (err) => console.log('Redis Client Error', err));
    });

    // await client.set('key', 'value');

    var batchSize = 0

    pipeline.on('data', data => {
        console.log(batchSize + ' processing ' + data[0]['value']['id'])
        data.forEach(async element => {
            await client.json.set(element['value']['id'], '.', element['value'])
        });
        batchSize += 1000

    })
    pipeline.on('end', data => { console.log('finished redis pipeline'); client.disconnect(); return; })

    // await client.disconnect()

    // let objectCounter = 0;
    // parser.on('data', data => console.log(data));
    // parser.on('end', () => console.log(`Found ${objectCounter} objects.`));

    // all_cards_request.body.pipe(parser);

    // const all_cards = await all_cards_request.json()
}