import Ember from 'ember';
import Traffic from './../deep_traffic/traffic/traffic';

export default Ember.Controller.extend({
  //traffic: new Traffic(),
  init(){
    this._super(...arguments);
    let traffic = new Traffic();
    this.set('traffic', traffic);
    this.traffic.update();
  },
  actions: {
    showForm() {
      this.set("userInputData", true);
    },
    submitData() {
      let userEmail = this.get('userEmail');
      let userNick = this.get('userNick');
      $.ajax({
        type: "POST",
        url: "http://deep-traffic-server.azurewebsites.net/api/users",
        data: {mph: 42, email: userEmail, user: userNick}
      });
      this.set("userInputData", false);
    }
  }
});
