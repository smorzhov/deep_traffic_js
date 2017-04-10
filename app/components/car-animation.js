import Ember from 'ember';
import Traffic from './../deep_traffic/traffic/traffic';

export default Ember.Component.extend({
    traffic: Ember.inject.service('traffic'),
    showCount: 1,
    cars: [],
    overtakenCars: 0,
    init: function () {
        this._super();
        // Update the time.
        this.set('cars', this.get('traffic').getCarsToShow());
        this.set('overtakenCars', this.get('traffic').getOvertakenCars());
        //this.updateCount();
        //this.renderMy();
        this.white = new Image();
        this.white.src= '../app/resources/images/car-white-small.png';
        this.red = new Image ();
        this.red.src = '../app/resources/images/car-red-small.png';
    },

    updateCount: function () {
        let _this = this;
        this.set('showCount', this.get('traffic').getCount());
        Ember.run.later(this, function () {
            _this.get('traffic').update();
            _this.set('cars', this.get('traffic').getCarsToShow());
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
    actions: {
        updateCars() {
            this.get('traffic').update();
            this.set('cars', this.get('traffic').getCarsToShow());
            let allOverTaken = this.get('overtakenCars');
            this.set('overtakenCars', allOverTaken + this.get('traffic').getOvertakenCars());
            this.renderMy();
        }
    },

   renderMy: function (){
      let canvas = document.getElementById('cars');
      let context = canvas.getContext('2d');
      let redCar=this.red;
      let whiteCar=this.white;
      this.cars.forEach(function(element) {
        if (element.isUserCar){
          context.drawImage(redCar, element.lane*30, element.patch*68);
        }
        else{
          context.drawImage(whiteCar, element.lane*30, element.patch*68);
        }
      });
    }
});
