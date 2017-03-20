'use strinct';

import Direction from './direction';
import { Speed } from './speed';

export default class Car {
    /**
     * Car constructor
     * @constructor
     * @throws Will throw the error if the given parameters have inappropriate types
     * @param {boolean} isUser shows whether the car is user's of not  
     * @param {Speed} speed car's speed 
     * @param {Direction} direction direction distribution 
     */
    constructor(isUser, speed, direction) {
        if (typeof isUser !== 'boolean') {
            throw new Error(`isUser must be boolean. Got ${isUser} instead!`);
        }
        this._isUser = isUser;
        if (!(speed instanceof Speed)) {
            throw new Error('speed must be instace of Speed!');
        }
        this._speed = this._originalSpeed = speed;
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

    /**
     * It changes the car's speed
     * @param {Speed} speed the new speed. If the speed is undefined, the original speed will be restored.
     * @return {boolean} Returns true, if the car's speed has been changed and false - otherwise.
     */
    changeSpeed(s) {
        if (s === undefined) {
            this._speed = this._originalSpeed;
            return true;
        }
        if (!(s instanceof Speed) || s.speed === this._speed) {
            return false;
        }
        this._speed = s;
        return true;
    }
}