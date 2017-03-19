'use strict';

import { getRandomInt } from './../../utils/random';

export default class Speed {
    /**
     * Speed constructor
     * @param {number} speed speed 
     * @param {number} patches patches the car passes by in one unit of time 
     */
    constructor(speed, patches) {
        this._speed = typeof speed === 'number' && speed >= 40 && speed <= 110 ? speed : 40;
        this._patches = typeof patches === 'number' && patches >= 0 ? patches : 0;
    }

    static get MAXIMUM() { return new Speed(110, 2); }

    static get MINIMUM() { return new Speed(50, 0.5); }

    get speed() { return this._speed; }

    set speed(speed) { this._speed = Number(speed); }

    get patches() { return this._patches; }

    /**
     * It generates car's speed
     * @static
     * @return {Speed} car's speed
     */
    static generate() {
        let speed = [
            { speed: 50, patches: 0.5 },
            { speed: 70, patches: 1 },
            { speed: 90, patches: 1.5 },
            { speed: 110, patches: 2 },
        ];
        let i = getRandomInt(0, speed.length);
        return new Speed(speed[i].speed, speed[i].patches);
    }
}