
FROM node:16-slim as node-installer


ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent --registry https://registry.npmmirror.com/

FROM node:16-slim
# 第一阶段: 使用官方 Node 镜像作为构建
FROM node:latest as builder

# 设置工作目录
WORKDIR /app

# 安装构建依赖
RUN apt-get update && \
    apt-get install -y build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV NGX_PREFIX=/etc/nginx/

# 下载并编译安装最新版本的 Nginx
RUN NGINX_VERSION=1.24.0 && \
    wget https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz && \
    tar -zxvf nginx-${NGINX_VERSION}.tar.gz && \
    cd nginx-${NGINX_VERSION} && \
    ./configure --prefix=/etc/nginx --conf-path=nginx.conf && \
    make


FROM node:latest

# 将 nginx 的默认配置文件替换为你自己的配置文件
# COPY nginx.conf /usr/local/nginx/conf/nginx.conf

RUN echo deb http://mirrors.ustc.edu.cn/debian buster main contrib non-free > /etc/apt/sources.list && \
  echo deb http://mirrors.ustc.edu.cn/debian buster-backports main contrib non-free >> /etc/apt/sources.list && \
  echo deb http://mirrors.ustc.edu.cn/debian buster-proposed-updates main contrib non-free >> /etc/apt/sources.list &&\
  echo deb http://mirrors.ustc.edu.cn/debian-security buster/updates main contrib non-free >> /etc/apt/sources.list

RUN apt-get update -y && apt-get install curl vim -y && apt-get remove --purge --auto-remove -y && apt-get clean

COPY --from=node-installer /usr/src/app/node_modules /usr/src/app/node_modules


# 从第一阶段复制编译好的 Nginx 二进制文件
COPY --from=builder /app/nginx-1.24.0/objs/nginx /usr/local/bin/nginx

RUN mkdir -p /etc/nginx/logs /var/log/nginx

# && apt-get clean

WORKDIR /usr/src/app

# --chown=node:node

COPY index.js index.js

EXPOSE 80

# RUN chown -R node /usr/src/app
# USER node

ENV NGINX_DIST /usr/share/nginx/html
ENV NGINX_CONFIG_D_DIR /etc/nginx/conf.d/micro-config.d
ENV S_REDIS_HOST redis
ENV S_REDIS_PORT 6379
ENV USE_REDIS none
# ENV USE_REDIS false
ENV S_NAMESPACE hzero_front_

ADD "docker/nginx.conf" "/etc/nginx/nginx.conf"
ADD "docker/index.html" "/usr/share/nginx/html/"
ADD "docker/mime.types" "/etc/nginx/mime.types"
ADD "docker/nginx-config-d/default.conf" "/etc/nginx/conf.d/default.conf"
COPY docker/docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "index.js"]
