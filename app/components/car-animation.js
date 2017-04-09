import Ember from 'ember';
import Traffic from './../deep_traffic/traffic/traffic';

export default Ember.Component.extend({
  didInsertElement() {
    let traffic = new Traffic();
    this.set('traffic', traffic);
    this.traffic.update();
    this.traffic.update();
  }
});
