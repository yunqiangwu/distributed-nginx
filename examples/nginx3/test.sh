#!/bin/sh

docker build . -t nginx-3:1 --no-cache

docker run --link=redis -ti --rm --name nginx-3 nginx-3:1
