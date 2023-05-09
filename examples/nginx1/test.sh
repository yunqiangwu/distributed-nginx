#!/bin/sh

docker build . -t nginx-1:1  --no-cache

docker run -p 80:80 -e USE_REDIS=mdns -ti --rm --name nginx-1 nginx-1:1
