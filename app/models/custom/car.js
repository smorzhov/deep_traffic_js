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
        this._speed = this._originalSpeed = parseInt(speed);
        if (isNaN(this._speed)) {
            throw new Error(`speed must be a positive number. Got ${speed} instead!`);
        }
        if (this._speed < this.MIN_SPEED) {
            this._speed = this.MIN_SPEED;
        }
        if (this._speed > this.MAX_SPEED) {
            this._speed = this.MAX_SPEED;
        }
        if (!(direction instanceof Direction)) {
            throw new Error(`direction must be instance of Direction`);
        }
        this._direction = direction;
    }

    /**
     * Minimum allowed speed 
     */
    static get MIN_SPEED() { return 40; }

    /**
     * Maximum allowed speed
     */
    static get MAX_SPEED() { return 110; }

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

    /**
     * It changes the car's speed
     * @param {number} speed the new speed. If the speed is undefined, the original speed will be restored.
     * @return {boolean} Returns true, if the car's speed has been changed and false - otherwise.
     */
    changeSpeed(speed) {
        if (speed === undefined) {
            this._speed = this._originalSpeed;
            return true;
        }
        let s = parseInt(speed);
        if (isNaN(s) || s < this.MIN_SPEED || s > this.MAX_SPEED || s === this._speed) {
            return false;
        }
        this._speed = s;
        return true;
    }
}