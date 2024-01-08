#!/bin/sh

# docker build . -t registry.choerodon.com.cn/hzero-fe-public/distributed-nginx:0.0.1

# docker run -d -p 6379:6379 -ti --name redis redis

docker run --rm -ti --name node-test -v `pwd`:/app node:latest node /app/index.js

docker run --rm -ti --name node-test -v `pwd`:/app node:latest bash
docker run --rm -ti --name node-test2 -v `pwd`:/app jonneywu/distributed-nginx:1 bash

docker run --rm -ti --name node-test2 -v `pwd`:/app registry.choerodon.com.cn/hzero-fe-public/distributed-nginx:1.24.0 bash
