#!/bin/sh

docker build . -t nginx-2:1 --no-cache

docker run -p 82:80 -ti --link redis:redis -e USE_REDIS=true --rm --name nginx-2 nginx-2:1
