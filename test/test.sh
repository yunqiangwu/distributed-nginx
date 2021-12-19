#!/bin/sh

# docker build . -t distributed-nginx:1

# docker run -d -p 6379:6379 -ti --name redis redis

docker run --rm -ti --name node-test -v `pwd`:/app node:latest node /app/index.js

