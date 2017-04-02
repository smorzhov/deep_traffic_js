import Ember from 'ember';

export default Ember.Service.extend({

    init() {
        if (!this.get('codeCached')) {
        this.set('codeCached', Ember.Object.create());
        }
 },

  getCode() {
    let code = this.get(`codeCached.${"code"}`);
    if (!code) {
      code = "Some code";
      this.set(`codeCached.${"code"}`, code);
    }
    return code;
  },

  setCode(newCode){
    this.set(`codeCached.${"code"}`, newCode);
  }
});
