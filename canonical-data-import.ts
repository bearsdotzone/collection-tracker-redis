import fetch from 'make-fetch-happen';
import streamarray from 'stream-json/streamers/StreamArray.js';
import Batch from 'stream-json/utils/Batch.js';
import chain from 'stream-chain';
import redis from 'redis';

main();

async function main() {
	const bulk_data_req = await fetch('https://api.scryfall.com/bulk-data');

	const bulk_data = await bulk_data_req.json();

	// TODO: Catch errors
	const bulk_data_uri = bulk_data['data'][3]['download_uri'];

	const batchSize = 1000;

	const all_cards_request = await fetch(bulk_data_uri);
	const all_cards_stream = chain.chain([
		all_cards_request.body.pipe(streamarray.withParser()),
		new Batch({ batchSize: batchSize })
	]);

	const client = redis.createClient({});
	await client.connect().then(() => {
		client.on('connect', () => console.log('connected to redis successfully!'));
		client.on('error', (err) => console.log('Redis Client Error', err));
	});

	var current_key = 0;

	all_cards_stream.on('data', (data) => {
		console.log(current_key + ' processing ' + data[0]['value']['id']);
		data.forEach(async (element) => {
			await client.json.set(element['value']['id'], '.', element['value']);
		});
		current_key += batchSize;
	});
	all_cards_stream.on('end', async () => {
		console.log('finished redis pipeline');
		await client.quit();
	});

}
