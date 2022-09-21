# collection-tracker-redis

Pulls the Scryfall all-cards database dump and stores it in Redis for usage in [collection-tracker](github.com/bearsdotzone/collection-tracker)

`npx ts-node --esm canonical-data-import.ts`

`docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest`
