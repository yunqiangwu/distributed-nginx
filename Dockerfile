FROM node:latest

RUN echo deb http://mirrors.ustc.edu.cn/debian buster main contrib non-free > /etc/apt/sources.list && \
  echo deb http://mirrors.ustc.edu.cn/debian buster-backports main contrib non-free >> /etc/apt/sources.list && \
  echo deb http://mirrors.ustc.edu.cn/debian buster-proposed-updates main contrib non-free >> /etc/apt/sources.list &&\
  echo deb http://mirrors.ustc.edu.cn/debian-security buster/updates main contrib non-free >> /etc/apt/sources.list

RUN apt-get update -y && apt-get install nginx -y && apt-get remove --purge --auto-remove -y && apt-get clean

ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent --registry https://registry.npmmirror.com/ && mv node_modules ../
COPY index.js index.js
EXPOSE 80
RUN chown -R node /usr/src/app
# USER node

ENV NGINX_DIST /usr/share/nginx/html
ENV NGINX_CONFIG_D_DIR /etc/nginx/conf.d/micro-config.d
ENV S_REDIS_HOST redis
ENV S_REDIS_PORT 6379
ENV USE_REDIS false
ENV S_NAMESPACE hzero_front_

ADD "docker/nginx.conf" "/etc/nginx/nginx.conf"
ADD "docker/nginx-config-d/default.conf" "/etc/nginx/conf.d/default.conf"
COPY docker/docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "index.js"]
