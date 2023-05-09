# distributed-nginx (分布式 nginx)

🍙 适用于微前端的去中心化分布式部署 nginx 服务器.

## 特性

- 支持 前端服务上线下线 自动更新微前端模块配置
- 完全实现了分布式去中心化
- 支持【微前端组】
- 支持 redis 协议和 multicast-dns 协议
- 支持 命名空间

## Getting Started

Manually,

```bash
git clone https://github.com/yunqiangwu/distributed-nginx.git
cd distributed-nginx
yarn run test
```

## 访问环境

获取微前端配置信息

- http://localhost/packages/microConfig.json
- http://localhost:82/packages/microConfig.json

从第一个微前端模块访问第二个微前端模块的页面

- http://localhost/packages/m2-2/package.json

从第一个微前端模块访问第二个微前端主模块的页面

- http://localhost/packages/main2/package.json

从第一个微前端模块访问第三个未暴露访问端口的微前端主模块的页面

- http://localhost/packages/main3/package.json

## 使用

```bash
mkdir project-dir
cd project-dit
```

创建文件

- Dockerfile

```
FROM registry.hand-china.com/hzero-fe-public/distributed-nginx:0.0.1
COPY dist /usr/share/nginx/html
```

- dist/package.json

```
{
    "name": "front-service-name"
}
```

- dist/packages/m2/package.json

```
{
    "name": "front-sub-service-name"
}
```

打包

```bash
docker build . -t nginx-test:1  --no-cache
```

测试

```bash
docker run -p 80:80 -ti --rm --name nginx-test nginx-test:1
```

## 环境变量配置

### S_NAMESPACE

  含义：命名空间， 用于部署不同开发环境的 nginx  
  默认值： hzero_front_
  > 注意：配置长度不能超过 200 字符

### USE_REDIS 

  含义：是否使用 redis 协议， 默认使用 mdns 协议 
  如果设置为 none 则关闭自动更新 微前端配置和代理
  如果设置为 mdns 则使用 mdns 协议自动更新 微前端配置和代理
  默认值： false

### S_REDIS_HOST

  含义：redis 服务器的 ip 或者 host  
  默认值： redis

### S_REDIS_PORT

  含义：redis 服务器 的 端口  
  默认值： 6379

### S_NO_CHANGE_MICRO

  含义：如果设置为 true ， 则不变更当前服务的数据， 只把当前服务的数据提供给其他服务使用
  默认值： false
