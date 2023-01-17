
# containers
# minio
```
docker run --rm --name=minio -p 9000:9000 -p 9001:9001 -v ~/volumes/minio:/data  minio/minio server /data --console-address ":9001"
```

# minio client
```
docker run -it --rm --name mc --entrypoint=/bin/bash minio/mc
mc alias set dev http://192.168.1.160:9000 minioadmin minioadmin
mc admin config get dev/ notify_nats
mc admin service restart dev/
mc event add dev/filestore arn:minio:sqs::localnats:nats --event put

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
docker run -it --rm --name ts-wrk -v ~/stuff/tsstorestuff:/app node-ts-imagemagic /bin/bash
cd app/
npx ts-node src/worker.ts
```

## server
```
docker run --rm --name ts-srv -it -v ~/stuff/tsstorestuff:/app -p 8001:8001 node-ts-imagemagic /bin/bash
cd app/
npx ts-node src/index.ts
```

## wscat
```
docker run -it --rm --name ts-wscat -v ~/stuff/tsstorestuff:/app node-ts-imagemagic /bin/bash
cd app
npx wscat -c ws://192.168.1.160:8001/ws

```
