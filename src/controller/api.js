const Base = require('./base.js');

module.exports = class extends Base {
  indexAction() {
    this.body = {
      'name': 'gaonan'
    }
  }
  async listAction() {
    let obj = await this.model("books").get();
    console.log('12222222222222222222222222222');
    console.log(obj);
    /*
    await this.model("crawler")
      //.douban("https://book.douban.com/subject/10546125/")
      .douban("http://gaonan.site")
      .then(data => {
        let title = data;

        console.log("=====================================");
        console.log(title);
        this.body = {
          aaa: 111
        }
      });
      */
  }
  upload () {
    console.log(this.ctx);
  }
};
