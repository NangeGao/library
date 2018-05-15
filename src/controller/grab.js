const Base = require('./base.js');

module.exports = class extends Base {
  async indexAction() {
    let url = this.ctx.param('url');
    if (url) {
      await this.model("crawler")
      .douban(url)
      .then(data => {
        console.log(data);
        this.assign({
          book: data
        })
      });
    }
    return this.display('grab');
  }
};
