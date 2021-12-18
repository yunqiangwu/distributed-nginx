#!/bin/sh

# docker run -d -ti --name redis redis

docker run --rm -ti --name node-test --link=redis -v `pwd`:/app node:latest node /app/index.js