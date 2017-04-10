import Ember from 'ember';
import Traffic from './../deep_traffic/traffic/traffic';

export default Ember.Service.extend({
  traffic:null,

  init() {
    let traffic = new Traffic();
    traffic.update();
    this.set('traffic', traffic);
    this.set('count',1);
    },
  update(){
    let updateTraffic = this.get('traffic');
    updateTraffic.update();
    this.set('traffic', updateTraffic);
    this.set('count',1);
  },
  getCarsToShow(){
    let cars=[];
    let trafficToShow = this.get('traffic').CARS();
    trafficToShow.forEach(function (item, key, mapObj) {
      let car = new Object();
      car.isUserCar = item.car.isUser;
      car.patch = item.distance;
      car.lane = item.lane;
      car.speed = item.car.speed.speed;
      cars.push(car);
    });
    return cars;
  },
  getOvertakenCars(){
    return this.get('traffic').OVERTAKEN_CARS();
  }
});

