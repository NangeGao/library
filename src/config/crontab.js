const Crawler = require("crawler");
const request = require("request");

let c = new Crawler({
  maxConnection: 5,
  rateLimit: 200,
  timeout: 3000,   //3s超时
  retryTimeout: 3000,  //超时自动重试，默认重试3次，间隔3s后重试
  rotateUA: true,
  userAgent: [
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36",  //360极速浏览器未升级前
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36 QIHU 360EE",  //360极速浏览器未升级为最新Chrome 63
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; .NET4.0C; .NET4.0E)",   //360极速浏览器兼容模式
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1 Safari/605.1.15",   //Macbook Safari浏览器
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",   //Firefox浏览器
  ],
});

const proRequest = think.promisify(request, request);

const _checkProxy = function (proxy) {
  //尝试请求网站来确定是否可用
  let requestUrl = "https://www.douban.com/about/disclaimer";

  console.time(proxy);
  return new Promise(function (resolve, reject) {
    try {
      request({
        url: requestUrl,
        proxy: proxy,
        method: "GET",
        timeout: 5000,   //5s超时，说明代理不好使
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3322.4 Safari/537.36',
        }
      }, function(error, response, body) {
        console.timeEnd(proxy);
        try {
          if (error) {
            resolve(false);
          }
          if (response && response.statusCode) {
            resolve(true);
          } else {
            resolve(false);
          };
        } catch (error) {
          console.log('error-error   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
        }
      });
    } catch (error) {
      console.log('error-error   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
      resolve('error-error');
    }

  });
}


process.on('uncaughtException', function (err) {
    console.log(err);
    //process.exit(1);
});

const getProxys = function () {
  return new Promise((resolve, reject) => {
    c.queue({
      uri: "http://www.goubanjia.com",
      //uri: "http://www.xicidaili.com/nn",
      callback (error, res, done) {
        if (error) {
          console.log(error);
          done();
        }

        let $ = res.$;
        let proxys = [];
        let $ipList = $("table.table tr");
        if ($ipList.length) {
          $ipList.each(function(item) {
            let tds = $(this).find("td");
            if (tds.length) {
              proxys.push(`${tds.eq(2).text()}://${tds.eq(0).text()}`);
            }
          })
        };
        done();
        resolve(proxys.slice(0,50));
      }
    });
  })
}

//定时任务，爬取可用代理
module.exports = [{
  interval: '1h',
  immediate: true,
  handle: () => {

    return;
    global.proxyList = [];
    getProxys().then(proxys => {
      let len = proxys.length;
      proxys.forEach(async function(item, index) {
        let a = await _checkProxy(item);
        if (a) {
          global.proxyList.push(item);
        }
        console.log(--len, item, a);
        if (!len) {
          console.log(proxyList);
        }
      })
    });
  }
}]
