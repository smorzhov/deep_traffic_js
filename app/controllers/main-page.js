import Ember from 'ember';
import Traffic from './../deep_traffic/traffic/traffic';

export default Ember.Controller.extend({
    //traffic: new Traffic(),
    init() {
        this._super(...arguments);
        let traffic = new Traffic();
        this.set('traffic', traffic);
        this.traffic.update();
    },
    actions: {
    }
});
