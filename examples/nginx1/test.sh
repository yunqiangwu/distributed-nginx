#!/bin/sh

docker build . -t nginx-1:1  --no-cache

docker run -p 80:80 -e BUILD_API_HOST=asdfawefasdf -e USE_REDIS=mdns -ti --rm --name nginx-1 nginx-1:1
