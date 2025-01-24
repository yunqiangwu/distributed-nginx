
docker build . -t hzero-fe-public/distributed-nginx:1.24.0

docker run  -ti --rm --name test --entrypoint '' hzero-fe-public/distributed-nginx:1.24.0 bash

docker run  -ti -d --name redis -p 6379:6379 redis

docker build . -t registry.choerodon.com.cn/hzero-fe-public/distributed-nginx:test

docker buildx build -t registry.choerodon.com.cn/hzero-fe-public/distributed-nginx:arm --platform linux/arm64 . --load

docker run -ti --rm --name test registry.choerodon.com.cn/hzero-fe-public/distributed-nginx:test bash

docker run -ti --rm -p 80:80  -v `pwd`/test-public:/usr/share/nginx/html -v `pwd`/docker/nginx.conf:/etc/nginx/nginx.conf --name test registry.choerodon.com.cn/hzero-fe-public/distributed-nginx:test bash

docker run -ti --rm -p 80:80 -v `pwd`/docker/nginx-config-d:/etc/nginx/conf.d  -v `pwd`/test-public:/usr/share/nginx/html -v `pwd`/docker/nginx.conf:/etc/nginx/nginx.conf --name test registry.choerodon.com.cn/hzero-fe-public/distributed-nginx:test bash
