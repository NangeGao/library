module.exports = class extends think.Model {
  get () {
    return this.select();
  }
};
