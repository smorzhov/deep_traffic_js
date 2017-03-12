'use strict';

import Car from './car';
import Direction from './direction';
import { getRandomInt } from './../utils/random';

export default class Traffic {
    /**
     * Highway traffic constructor
     * @constructor
     * @param {number} numberOfCars number of cars that always should be on the highway 
     */
    constructor(numberOfCars) {
        this._numberOfCars = numberOfCars;
        this._cars = this._generateCars();
        this._traffic = this._generateCarPositions();
    }

    /**
    * It updates generated traffic
    */
    update() {
        //TODO
    }

    /**
     * It generates cars
     * @private
     * @return {Map} Map with generated cars
     */
    _generateCars() {
        let cars = new Map();
        cars.set(1, new Car(true, 60, new Direction(1, 0, 0)));
        for (let i = 0; i < this._numberOfCars; i++) {
            cars.add(i + 2, new Car(false, getRandomInt(40, 110), Direction.generate(0.5)));
        }
        return cars;
    }

    /**
     * It generates coordinates of cars
     * @private
     */
    _generateCarPositions() {
        //TODO
    }
}