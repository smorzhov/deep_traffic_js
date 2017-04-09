import Ember from 'ember';
import Traffic from './../deep_traffic/traffic/traffic';

export default Ember.Component.extend({
  traffic: Ember.inject.service('traffic'),
  showCount: 1,
  cars:[],
  init: function() {
    this._super();
    // Update the time.
    this.set('cars',this.get('traffic').getCarsToShow());
    //this.updateCount();
  },

  updateCount: function() {
    let _this = this;
    this.set('showCount', this.get('traffic').getCount());
    Ember.run.later(this, function() {
      _this.get('traffic').update();
      _this.set('cars',this.get('traffic').getCarsToShow());
      _this.updateCount();
    }, 1000);
  },
  /*actions: {
    show() {
      this.set('showCount', this.get('traffic').getCount());
      Ember.run.later(this, function() {
        this.get('traffic').setCount();
        this.set('showCount', this.get('traffic').getCount());
        this.show();
      }, 100);
    }
  }*/

  /*updateCars(){
    this.get('traffic').update();
    this.set('cars',this.get('traffic').getCarsToShow());
  },*/
  actions:{
    updateCars(){
      this.get('traffic').update();
      this.set('cars',this.get('traffic').getCarsToShow());
    }
  }
});
