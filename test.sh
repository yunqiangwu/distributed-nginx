

docker build . -t hzero-fe-public/distributed-nginx:1.24.0


docker run  -ti --rm --name test --entrypoint '' hzero-fe-public/distributed-nginx:1.24.0 bash


