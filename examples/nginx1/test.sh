#!/bin/sh

docker build . -t nginx-1:1  --no-cache

docker run --link=redis -p 80:80 -ti --rm --name nginx-1 nginx-1:1
