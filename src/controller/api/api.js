const Base = require('../base.js');

module.exports = class extends Base {
  indexAction() {
    this.body = {
      'name': 'gaonan'
    }
  }
  async listAction() {
    await this.model("crawler")
      //.douban("https://book.douban.com/subject/10546125/")
      .douban("http://gaonan.site")
      .then(data => {
        let title = data;

        console.log("=====================================");
        console.log(title);
        this.body = {
          'title': title
        }
      });
  }
};
