#!/bin/sh

docker build . -t nginx-3:1 --no-cache

docker run -ti --rm -e USE_REDIS=mdns --name nginx-3 nginx-3:1
