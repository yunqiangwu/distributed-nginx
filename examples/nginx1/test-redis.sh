#!/bin/sh

docker build . -t nginx-1:1  --no-cache

docker run -p 80:80 -ti --link redis:redis -e USE_REDIS=true --rm --name nginx-1 nginx-1:1
