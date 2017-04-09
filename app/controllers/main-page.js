import Ember from 'ember';
import Traffic from './../deep_traffic/traffic/traffic';

export default Ember.Controller.extend({
  //traffic: new Traffic(),
    userInputData: false,
  init(){
    this._super(...arguments);
    let traffic = new Traffic();
    this.set('traffic', traffic);
    this.traffic.update();
  },
  /*reopen(){
   let traffic = new Traffic();
   this.set('traffic', traffic);
   this.traffic.update();
   },*/
  actions: {
    updateTraffic() {
      this.traffic.update();
    },
    showForm() {
        this.set("userInputData", true);
    },
    submitData() {
        this.set("userInputData", false);
    }
  }
});
