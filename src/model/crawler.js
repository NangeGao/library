const Crawler = require("crawler");

let c = new Crawler({
  maxConnection: 10,
  timeout: 4000,   //4s超时
  retryTimeout: 1000,  //超时自动重试，默认重试3次，间隔1s后重试
  rotateUA: true,
  //proxy: _randomProxy(),
  userAgent: [
// "I'm a Spider, Ni Neng Za di !!!",   //我就是爬虫，你能咋地！！
"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36",  //360极速浏览器未升级前
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36 QIHU 360EE",  //360极速浏览器未升级为最新Chrome 63
  "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; .NET4.0C; .NET4.0E)",   //360极速浏览器兼容模式
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1 Safari/605.1.15",   //Macbook Safari浏览器
  "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",   //Firefox浏览器
  ],
  callback (error, res, done) {
    if (error) {
      console.log(error);
      done();
    }

    done();
  }
});

function _randomProxy () {
  let proxy = "";
  if (global.proxyList && global.proxyList.length) {
    let len = proxyList.length;
    let randomIndex = parseInt((Math.random()*len).toString());
    proxy = proxyList[randomIndex];
  }
  return proxy;
}

module.exports = class extends think.Model {

  /**
   * 核心抓取函数
   * @param url {String} 要抓取的地址
   * @param params {Mixed} 参数配置规则需要参考crawler文档
   */
  grab (url, params) {
    const q = {
      uri: url,
    };
    return new Promise((resolve, reject) => {
      //耗时计算
      const t1 = process.uptime();

      q.callback = (error, res, done) => {
        if (error) {
          done();
          reject(error);
          return reject({
            "errno": "0000",
            "errmsg": error
          })
        }
        let $ = res.$;
        if (!$("title")) {
          console.log(res.body);
        }
        console.log(`书籍 - ${$("title").text() || $("h1").text()} 爬取成功，耗时${(process.uptime() - t1).toFixed(3)}s`);

        //爬取成功，把response作为参数传递给后续回调函数使用
        done();
        resolve(res);
      }
      //判断是否有额外参数，参数配置规则需要参考crawler文档
      if (params) {
        Object.assign(q, params);
      }

      c.queue(q);
    }).catch(error => {
      console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      console.log(error);
      return {
        "errno": "0000",
        "errmsg": "抓取失败"
      }
    });
  }

  /********
   * 爬取豆瓣
   * @param url {String} 要抓取的地址
   * @param params {Mixed} 参数配置规则需要参考crawler文档
   * ******/
  douban (url, params) {
    return this.grab(url, params).then(function(res) {
      try {
        let $ = res.$;

        if (!$('title').length) {
          return {
            "title": $('h1').text()
          }
        }

        let book = {
          "title": $('title').text(),
          "name": $('h1').text().trim(),
          "pic": $('#mainpic a').attr("href"),
          "info": $('#info').html().trim()
        }

        return book;
      } catch (err) {
        console.log(err);
        return {
          "title": "爬取失败，请刷新重试"
        }
      }
    });
  }


  /********
   * 搜索豆瓣suggestion
   * @param keyword {String} 要抓取的地址
   * @param params {Mixed} 参数配置规则需要参考crawler文档
   * ******/
  search (keyword, params) {
    let url = `https://book.douban.com/j/subject_suggest?q=${keyword}&url=https://book.douban.com`;
    return new Promise((resolve, reject) => {
      c.direct({
        uri: url,
        referer: "https://book.douban.com/subject/20515024/",
        callback (error, res) {
          if (error) {
            reject(error);
          }
          console.log(res.body);
          let data = JSON.parse(res.body);
          return resolve(data);
          data.forEach(book => {
            let img = book.pic.split('/s/').join('/l/');
            book.pic = img;
          })
        }
      })
    });


    return;
    return this.grab(url, params).then(function(res) {
      try {
        let $ = res.$;

        if (!$('title').length) {
          return {
            "title": $('h1').text()
          }
        }

        let book = {
          "title": $('title').text(),
          "name": $('h1').text().trim(),
          "pic": $('#mainpic a').attr("href"),
          "info": $('#info').html().trim()
        }

        return book;
      } catch (err) {
        console.log(err);
        return {
          "title": "爬取失败，请刷新重试"
        }
      }
    });
  }


};
