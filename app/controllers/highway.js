import Ember from 'ember';
import Traffic from './../models/traffic';

export default Ember.Controller.extend({
    init: function() {
        let traffic = new Traffic();
        this.set('traffic', traffic);
        this.updateTraffic();
    },

    /**
     * This updates the traffic every 100 ms
     */
    updateTraffic: function() {
        Ember.run.later(() => {
            this.traffic.update();
            //TODO: update frame
        }, 100);        
    }
});
