'use strict';

import { getRandomInt } from './../utils/random';
import Speed from './speed';

export default class SpeedGenerator {
    /**
     * Speed generator constructor
     * @constructor
     * @throws It throws error if speedPatchesRatio has incorrect data
     * @param {Array} speedPatchesRatio array of speed patches ratio objects
     */
    constructor(speedPatchesRatio) {
        if (!this._isSpeedPatchesRatioValid(speedPatchesRatio)) {
            throw new Error('speedPatchRatio has incorrect data!');
        } else {
            this._speedPatchesRatio = speedPatchesRatio.sort((a, b) => {
                return a.speed - b.speed;
            });
        }
    }

    get MAXIMUM_SPEED() {
        return new Speed(
            this._speedPatchesRatio[this._speedPatchesRatio.length - 1].speed,
            this._speedPatchesRatio[this._speedPatchesRatio.length - 1].patches
        );
    }

    get MINIMUM_SPEED() {
        return new Speed(
            this._speedPatchesRatio[0].speed,
            this._speedPatchesRatio[0].patches
        );
    }

    /**
     * It generates car's speed
     * @return {Speed} Returns speed object
     */
    generate() {
        let i = getRandomInt(0, this._speedPatchesRatio.length);
        return new Speed(this._speedPatchesRatio[i].speed, this._speedPatchesRatio[i].patches);
    }

    /**
     * It validates speedPatchesRatio object
     * @param {Array} speedPatchesRatio array of speed patches ratio objects
     * @return {boolean} Returns true, if speedPatchesRatio is correct and false - otherwise
     */
    _isSpeedPatchesRatioValid(speedPatchesRatio) {
        if (!Array.isArray(speedPatchesRatio)) {
            return false;
        }
        speedPatchesRatio.every(value => {
            return typeof value.speed === 'number' && value.speed > 0 && value.speed < 110 &&
                typeof value.patches === 'number' && value.patches > 0;
        });
    }

    /**
     * По скорости возвращает количество патчей
     * @param {number} speed скорость
     * @return {number} количество патчей
     */
    getPatchesToMove(speed) {
        let ratio = this._speedPatchesRatio.find(ratio => { return ratio.speed === speed; });
        return ratio === undefined ? undefined : ratio.patches; 
    }
}