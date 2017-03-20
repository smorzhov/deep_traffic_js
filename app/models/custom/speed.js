'use strict';

export default class Speed {
    /**
     * Speed constructor
     * @constructor
     * @param {number} speed speed 
     * @param {number} patches patches the car passes by in one unit of time 
     */
    constructor(speed, patches) {
        this._speed = typeof speed === 'number' && speed >= 0 && speed <= 110 ? speed : 0;
        this._patches = typeof patches === 'number' && patches >= 0 ? patches : 0;
    }

    get speed() { return this._speed; }

    get patches() { return this._patches; }
}