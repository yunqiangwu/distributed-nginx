#!/bin/sh

docker build . -t nginx-2:1 --no-cache

docker run -p 82:80 -e USE_REDIS=mdns -ti --rm --name nginx-2 nginx-2:1
