'use strinct';

import Direction from './direction';

export default class Car {
    /**
     * Car constructor
     * @constructor
     * @throws Will throw the error if the given parameters have inappropriate types
     * @param {boolean} isUser shows whether the car is user's of not  
     * @param {number} speed car's speed 
     * @param {Direction} direction direction distribution 
     */
    constructor(isUser, speed, direction) {
        if (typeof isUser !== 'boolean') {
            throw new Error(`isUser must be boolean. Got ${isUser} instead!`);
        }
        this._isUser = isUser;
        this._speed = parseInt(speed);
        if (isNaN(this._speed)) {
            throw new Error(`speed must be a positive number. Got ${speed} instead!`);
        }
        if (this._speed < 40) {
            this._speed = 40;
        }
        if (this._speed > 110) {
            this._speed = 110;
        }
        if (!(direction instanceof Direction)) {
            throw new Error(`direction must be instance of Direction`);
        }
        this._direction = direction;
    }

    get isUser() { return this._isUser; }

    get speed() { return this._speed; }

    /**
     * Using the given direction distribution, it return the next direction.
     * @return {string} direction
     */
    get direction() {
        let n = Math.random();
        let sum = 0.0;
        for (let element in this._direction.distribution) {
            if (n > sum && n <= sum + element.probability) {
                return element.direction;
            }
            sum += element.probability;
        }
    }
}