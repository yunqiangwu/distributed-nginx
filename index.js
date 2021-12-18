const { exec } = require("child_process");
const { existsSync, readdirSync, writeFileSync, mkdir, mkdirSync, unlinkSync } = require("fs");
const os=require("os");
const path = require("path");

// test remove todo
// process.env.NGINX_DIST = path.resolve(__dirname, 'test/dist1');
// process.env.NGINX_CONFIG_D_DIR = path.resolve(__dirname, 'test/nginx-config/micro-config.d');

const getIp = () => {
  const networkInterfaces=os.networkInterfaces();

  const allInterNames = Object.keys(networkInterfaces);
  let currentInterName = allInterNames.find(k => k === 'eth0');

  if(!currentInterName) {
    currentInterName= allInterNames[0]
  }

  if(currentInterName) {
    const inter = networkInterfaces[currentInterName].find(item => item.family === 'IPv4');
    return inter.address;
  }

  return '127.0.0.1';
};

const throttle = function(func, wait = 300) {
  var timeout, context, args, result;
  
  // 上一次执行回调的时间戳
  var previous = 0;
  
  let options;
  // 无传入参数时，初始化 options 为空对象
  if (!options) options = {};

  var later = function() {
    // 当设置 { leading: false } 时
    // 每次触发回调函数后设置 previous 为 0
    // 不然为当前时间
    previous = options.leading === false ? 0 : Date.now();
    
    // 防止内存泄漏，置为 null 便于后面根据 !timeout 设置新的 timeout
    timeout = null;
    
    // 执行函数
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  // 每次触发事件回调都执行这个函数
  // 函数内判断是否执行 func
  // func 才是我们业务层代码想要执行的函数
  var throttled = function() {
    
    // 记录当前时间
    var now = Date.now();
    
    // 第一次执行时（此时 previous 为 0，之后为上一次时间戳）
    // 并且设置了 { leading: false }（表示第一次回调不执行）
    // 此时设置 previous 为当前值，表示刚执行过，本次就不执行了
    if (!previous && options.leading === false) previous = now;
    
    // 距离下次触发 func 还需要等待的时间
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    
    // 要么是到了间隔时间了，随即触发方法（remaining <= 0）
    // 要么是没有传入 {leading: false}，且第一次触发回调，即立即触发
    // 此时 previous 为 0，wait - (now - previous) 也满足 <= 0
    // 之后便会把 previous 值迅速置为 now
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        
        // clearTimeout(timeout) 并不会把 timeout 设为 null
        // 手动设置，便于后续判断
        timeout = null;
      }
      
      // 设置 previous 为当前时间
      previous = now;
      
      // 执行 func 函数
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      // 最后一次需要触发的情况
      // 如果已经存在一个定时器，则不会进入该 if 分支
      // 如果 {trailing: false}，即最后一次不需要触发了，也不会进入这个分支
      // 间隔 remaining milliseconds 后触发 later 方法
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

  // 手动取消
  throttled.cancel = function() {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };

  // 执行 _.throttle 返回 throttled 函数
  return throttled;
};

function parsePackageName(name) {
  return name.replace(/([\\\/])|(\-)/g, '_').replace(/^@/, '');
}

const delay = (timeout = 0) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(null);
    }, timeout);
  });
};

const getCurrentPackageMap = (nginxDist) => {
  const configMap = {};

  const mainPackageJsonFile = path.resolve(nginxDist, 'package.json');
  if(existsSync(mainPackageJsonFile)){
    const mainPackageInfo = require(mainPackageJsonFile);
    if(mainPackageInfo.name) {
      configMap[parsePackageName(mainPackageInfo.name)] = {
        packageInfo: mainPackageInfo,
        _isMainPackage: true
      }
    }
  }

  const mainPackagesDir = path.resolve(nginxDist, 'packages');
  if(existsSync(mainPackagesDir)) {
    readdirSync(mainPackagesDir).forEach(packageName => {
      const packageJsonFile = path.resolve(mainPackagesDir, packageName, 'package.json');
      if(existsSync(packageJsonFile)) {
        const packageInfo = require(packageJsonFile);
        configMap[packageName] = {
          packageInfo: packageInfo,
        }
        return;
      }
      const remoteEntryFile = path.resolve(mainPackagesDir, packageName, 'remoteEntry.js');
      if(existsSync(remoteEntryFile)) {
        configMap[packageName] = {
          packageInfo: {
            name: packageName
          },
        }
        return;
      }
    })
  }

  return configMap;
};

(async () => {

  const NGINX_DIST = process.env.NGINX_DIST || `/usr/share/nginx/html`;
  const NGINX_CONFIG_D_DIR = process.env.NGINX_CONFIG_D_DIR || `/etc/nginx/conf.d/micro-config.d`;
  const S_REDIS_HOST = process.env.S_REDIS_HOST || 'redis';
  const S_REDIS_PORT = process.env.S_S_REDIS_PORT || '6379';

  if(!existsSync(NGINX_DIST)) {
    console.error(`dir \`${NGINX_DIST}\` not exist! maybe env 'NGINX_DIST' not set!`)
    process.exit(1);
    // NGINX_DIST = path.resolve(__dirname, 'test/dist1');
  }
  const packages_dir = path.resolve(NGINX_DIST, 'packages');
  if(!existsSync(packages_dir)) {
    mkdirSync(packages_dir);
  }
  if(!existsSync(NGINX_CONFIG_D_DIR)) {
    mkdirSync(NGINX_CONFIG_D_DIR, {recursive: true});
  }

  const currentIP = getIp();
  const onlineNginxClientMap = {};

  const currentPackageMap = getCurrentPackageMap(NGINX_DIST);

  console.log('currentPackageMap', {
    currentPackageMap
  });

  const nginxReload = throttle((cb) => {
    exec('nginx -s reload', (err, res ) => {
      if(err) {
        console.error(err);
      }
      if(res) {
        console.log(res);
      }
      if(cb) {
        cb();
      }
    });
  }, 1000);

  const refreshMicroConfig = throttle(() => {
    console.log('refreshMicroConfig', JSON.stringify(onlineNginxClientMap, null, 2));

    const microConfig = {};

    let NginxMicroConfig = ``;

    Object.keys(onlineNginxClientMap).forEach(nginxIp => {
      const _microConfig = onlineNginxClientMap[nginxIp];
      
        Object.keys(_microConfig).forEach(packageName => {
          if(nginxIp !== currentIP && microConfig[packageName]) {
            return;
          }
          if(nginxIp === currentIP && _microConfig[packageName]._isMainPackage) {
            return;
          }
          microConfig[packageName] = _microConfig[packageName].packageInfo;
        });

        Object.keys(_microConfig).forEach(packageName => {
          if(nginxIp === currentIP) {
            return;
          }
          if(_microConfig[packageName]._isMainPackage) {
            NginxMicroConfig = `${NginxMicroConfig}
            location /packages/${packageName}/ {
              proxy_pass http://${nginxIp}/;
              proxy_set_header host $host;
              proxy_set_header X-Real-IP      $remote_addr;
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            }
            `
          } else {
            NginxMicroConfig = `${NginxMicroConfig}
            location /packages/${packageName}/ {
              proxy_pass http://${nginxIp};
              proxy_set_header host $host;
              proxy_set_header X-Real-IP      $remote_addr;
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            }
            `
          }

        });
    });

    const microConfigJsonFile = path.resolve(packages_dir, 'microConfig.json');
    const NginxMicroConfigFile = path.resolve(NGINX_CONFIG_D_DIR, 'default.conf');
    writeFileSync(microConfigJsonFile, JSON.stringify(microConfig, null, 2));
    writeFileSync(NginxMicroConfigFile, NginxMicroConfig);

    nginxReload(() =>{
      console.log(NginxMicroConfig);
    });

  }, 1000);

  // process.exit();

  const { createClient } = require('redis');

  const client = createClient({
      url: `redis://${S_REDIS_HOST}:${S_REDIS_PORT}`
  });

  client.on('error', (err) => console.log('Redis Client Error', err));

  await client.connect();

  const onlineSubscriber = client.duplicate();
  const offLineSubscriber = client.duplicate();

  const clean = async () => {
    console.log('beforeExit: cleaning');
    await client.publish('offline', currentIP);
    // console.log('beforeExit2: cleaning');
    // await Promise.all([onlineSubscriber.unsubscribe('online'), offLineSubscriber.unsubscribe('offline')]);
    // console.log('beforeExit3: cleaning');
    // await Promise.all([client.quit(),offLineSubscriber.quit(), onlineSubscriber.quit()]);
    console.log('beforeExit4: cleaned');
    process.exit();
  }

  process.on('SIGINT', () => {
    clean();
  });

  await client.publish('online', JSON.stringify({
    ip: currentIP,
    packageMap: currentPackageMap,
  }));

  const getInfoReplySubscriber = client.duplicate();
  await getInfoReplySubscriber.connect();

  await getInfoReplySubscriber.subscribe(`get-info`, async (geter_ip) => {
    await client.publish(`online-for-${geter_ip}`, JSON.stringify({
      ip: currentIP,
      packageMap: currentPackageMap,
    }));
  });

  await Promise.all([offLineSubscriber.connect(), onlineSubscriber.connect()]);

  await Promise.all([offLineSubscriber.subscribe('offline', (data) => {
    console.log(`offline: ${data}`)
    delete onlineNginxClientMap[data];
    refreshMicroConfig();
  }), onlineSubscriber.subscribe(['online', `online-for-${currentIP}`], (data) => {
    const msgObj = JSON.parse(data);
    onlineNginxClientMap[msgObj.ip] = msgObj.packageMap;
    console.log(`online: ${msgObj.ip}`);
    refreshMicroConfig();
  })]);

  await client.publish('get-info', currentIP);

  console.log(`readey!!!`);

  while(true) {
    await delay(600000);
  }
  
})();
