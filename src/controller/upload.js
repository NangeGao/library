const Base = require('./base.js');
const fs = require('fs');
const path = require('path');

module.exports = class extends Base {
  indexAction() {
    let keyword = this.ctx.param('keyword');

    let file = this.file("file");
    if (!file) {
      return this.display('upload');
    }
    console.log(file);
    let uploadPath = path.join(think.ROOT_PATH, 'www/static/upload');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    };
    //let uploadPath = path.join(think.ROOT_PATH, 'www/upload', file.name);
    console.log(uploadPath);

    fs.renameSync(file.path, path.join(uploadPath, file.name));

    return this.display('upload');
  }
};
