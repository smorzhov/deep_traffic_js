'use strict';

import { getRandomArbitrary } from './../../utils/random';

export default class Direction {
    /**
     * Direction constructor
     * @constructor
     * @throws Will throw the error, if sum of the given probabilities is not equal to 1
     * @param {number} straight probability not to change the direction
     * @param {number} left probability to go left
     * @param {number} right probability to go right
     */
    constructor(straight, left, right) {
        this._straight = Direction.checkParam('straight', straight);
        this._right = Direction.checkParam('right', right);
        this._left = Direction.checkParam('left', left);
        if (!this._validateDirectionDistribution) {
            throw new Error(`The sum of the probabilities must be equal to 1. Now it's ${this._straight + this._left + this._right}`);
        }
        this._distribution = this._assignDistribution();
    }

    get straight() { return this._straight; }

    get left() { return this._left; }

    get right() { return this._right; }

    get distribution() { return this._distribution; }

    /**
     * It generates random direction distribution with straight probability greater or equal to the given probability
     * @param {number} probability probability
     * @return {Direction} Direction object
     */
    static generate(probability) {
        if (typeof probability !== 'number' || probability < 0 || probability >= 1) {
            return undefined;
        }
        let left = getRandomArbitrary(0, probability / 2);
        let right = getRandomArbitrary(0, probability / 2);
        let straight = 1 - left - right;
        return new Direction(straight, left, right);
    }

    /**
     * It checks whether the given parameter is a valid number between 0 and 1
     * @static
     * @throws Will throw an error if param is not a valid number
     * @param {sring} type param type
     * @param {number} param parameter that will be checked
     * @return {number} param converted to number type
     */
    static checkParam(type, param) {
        let parsed = Number(param);
        if (isNaN(parsed) || parsed < 0 || parsed > 1) {
            throw new Error(`${type} must be a number between 0 and 1. Got ${param} instead`);
        }
        return parsed;
    }

    /**
     * It validates distribution
     * @return {boolean} true, if distribution is a valid one, and false - otherwise
     */
    _validateDirectionDistribution() {
        let sum = this._straight + this._right + this._left;
        return !isNaN(sum) && sum === 1;
    }

    /**
     * @return {Array} distribution array with probabilities sorted in ascending order
     */
    _assignDistribution() {
        return [
            { direction: 'straight', probability: this._straight },
            { direction: 'right', probability: this._right },
            { direction: 'left', probability: this._left }
        ].sort((a, b) => {
            return a.probability - b.probability;
        });
    }
}
