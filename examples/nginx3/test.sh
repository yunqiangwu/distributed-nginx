#!/bin/sh

docker build . -t nginx-3:1 --no-cache

docker run -ti --rm --name nginx-3 nginx-3:1
