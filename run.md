
# containers
# minio
```
docker run --rm --name=minio -p 9000:9000 -p 9001:9001 -v ~/volumes/minio:/data  minio/minio server /data --console-address ":9001"
```

# nats
```
docker run -it --rm --name=nats -p 4222:4222 -p 8222:8222 nats
```

# service container
```
docker build -t node-ts-imagemagic .
```

# services
## worker
```
docker run -it -v ~/stuff/tsstorestuff:/app node-ts-imagemagic /bin/bash
cd app/
npx ts-node src/worker.ts
```

## server
```
docker run -it -v ~/stuff/tsstorestuff:/app -p 8001:8001 node-ts-imagemagic /bin/bash
cd app/
npx ts-node src/index.ts
```
