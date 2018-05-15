const Base = require('./base.js');

module.exports = class extends Base {
  async indexAction() {
    let keyword = this.ctx.param('keyword');
    if (keyword) {
      await this.model("crawler")
      .search(keyword)
      .then(data => {
        this.assign({
          list: data,
          listStr: JSON.stringify(data),
        })
      });
    }
    return this.display('search');
  }
};
