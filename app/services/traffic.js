import Ember from 'ember';
import Traffic from './../deep_traffic/traffic/traffic';

export default Ember.Service.extend({
    traffic: null,

    init() {
        let traffic = new Traffic();
        traffic.update();
        this.set('traffic', traffic);
        this.set('count', 1);
    },
    update() {
        let updateTraffic = this.get('traffic');
        updateTraffic.update();
        this.set('traffic', updateTraffic);
        this.set('count', 1);
    },
    getCarsToShow() {
        let cars = [];
        let trafficToShow = this.get('traffic').cars;
        trafficToShow.forEach(function (item, key) {
            let car = {};
            car.isUserCar = item.car.isUser;
            car.patch = item.distance || item.patch;
            car.lane = item.lane;
            car.speed = item.car.speed.speed;
            car.carID = key;
            cars.push(car);
        });
        return cars;
    },
    getOvertakenCars() {
        return this.get('traffic').overtakenCars;
    },
    getPatchesAhead() {
        return this.get('traffic').MINIMUM_PATCHES_AHEAD;
    },
    getPatchesBehind() {
        return this.get('traffic').MINIMUM_PATCHES_BEHIND;
    },
    getNumberOfLanes() {
        return this.get('traffic').NUMBER_OF_LANES;
    }
});

