import fetch from 'make-fetch-happen';
import redis from 'redis';

main();

async function main() {
	const bulk_data_req = await fetch('https://api.scryfall.com/bulk-data');

	const bulk_data = await bulk_data_req.json();

	// TODO: Catch errors
	const bulk_data_uri = bulk_data['data'][0]['download_uri'];

	const batchSize = 1000;

	const all_cards_request = await fetch(bulk_data_uri);

	const client = redis.createClient({});
	await client.connect().then(() => {
		client.on('connect', () => console.log('connected to redis successfully!'));
		client.on('error', (err) => console.log('Redis Client Error', err));
	});

	const all_cards_data = await all_cards_request.json();


	for (let i in all_cards_data) {
		let cardData = all_cards_data[i];
		if(parseInt(i) % 1000 == 0)
		{
			console.log(i + ' processing ' + cardData['id']);
		}
		// console.log(all_cards_data[i]);
		await client.json.set(cardData['id'], '.', cardData);
	}

	// all_cards_stream.on('data', (data) => {
	// 	console.log(current_key + ' processing ' + data[0]['value']['id']);
	// 	data.forEach(async (element) => {
	// 		await client.json.set(element['value']['id'], '.', element['value']);
	// 	});
	// 	current_key += batchSize;
	// });
	// all_cards_stream.on('end', () => {
	// 	console.log('finished redis pipeline');
	// });
	await client.quit();
}
