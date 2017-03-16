'use strict';

import Car from './car';
import Direction from './direction';
import { getRandomInt } from './../../utils/random';
import { readFileSync } from './../../utils/io';

export default class Traffic {
    /**
     * Highway traffic constructor
     * @constructor
     * @throws It throws error if the given parameters have incorrect data or if traffic_constant.json file has not been found.
     * @param {number} numberOfLanes number of lanes on highway 
     * @param {number} patchesAhead patches ahead the user's car
     * @param {number} patchesBehind patches behind the user's car
     */
    constructor(numberOfLanes, patchesAhead, patchesBehind) {
        this._numberOfLanes = parseInt(numberOfLanes);
        this._patchesAhead = parseInt(patchesAhead);
        this._patchesBehind = parseInt(patchesBehind);
        if (this._isParamsValid()) {
            let message = 'Error while creating traffic:\n';
            message += `  numberOfLanes must be an integer between 1 and ${this.MAXIMUM_NUMBER_OF_LANES}. Got ${numberOfLanes}\n`;
            message += `  patchesAhead must be an integer between 1 and ${this.MAXIMUM_PATCHES_AHEAD}. Got ${patchesAhead}\n`;
            message += `  patchesBehind must be an integer between 1 and ${this.MAXIMUM_PATCHES_BEHIND}. Got ${patchesBehind}\n`;
            throw new Error(message);
        }
        this._constants = readFileSync('./traffic_constants.json', 'utf8');
        if (!this._isConstantsValid(this._constants)) {
            throw new Error('traffic_constants.json has incorrect data!');
        }
        /**
         * User's car will be like a center of coordinate system where X-axis means lanes and Y-axis means distance in meters.
         * User's car distance must always be equal to 0. Therefore cars that are behind user's car will have negative distance
         * and cars that are ahead - positive distance.
         */
        this._usersCar = {
            car: new Car(true, Car.MAX_SPEED, new Direction(1, 0, 0)),
            lane: getRandomInt(0, this._numberOfLanes),
            distance: 0
        };
        this._traffic = this._generateCars(
            this._patchesAhead < this.MINIMUM_PATCHES_AHEAD ? this.MINIMUM_PATCHES_AHEAD : this._patchesAhead,
            this._patchesBehind < this.MINIMUM_PATCHES_BEHIND ? this.MINIMUM_PATCHES_BEHIND : this._patchesBehind
        );
    }

    get MAXIMUM_NUMBER_OF_LANES() { return this._constants.maximumNumberOfLanes; }

    /**
     * Minimum patches ahead. It also defines the highway size that will be shown to the user.
     */
    get MINIMUM_PATCHES_AHEAD() { return this._constants.patches.ahead.minimum; }

    get MAXIMUM_PATCHES_AHEAD() { return this._constants.patches.ahead.maximum; }

    /**
     * Minimum patches behind. It also defines the highway size that will be shown to the user.
     */
    get MINIMUM_PATCHES_BEHIND() { return this._constants.patches.behind.minimum; }

    get MAXIMUM_PATCHES_BEHIND() { return this._constants.patches.behind.maximum; }

    get SAFE_DISTANCE() { return this._constants.safeDistance; }

    get STRAIGHT_PROBABILITY() { return this._constants.straightProbability; }

    /**
    * It updates generated traffic
    */
    update() {
        //TODO
    }

    /**
     * It checks the parameters
     * @return {boolean} Returns true, if the parameters are correct and false - otherwise
     */
    _isParamsValid() {
        return isNaN(this._numberOfLanes) || this._numberOfLanes < 1 || this._numberOfLanes > this.MAXIMUM_NUMBER_OF_LANES ||
            isNaN(this._patchesAhead) || this._patchesAhead < 1 || this._patchesAhead > this.MAXIMUM_PATCHES_AHEAD ||
            isNaN(this._patchesBehind) || this._patchesBehind < 1 || this._patchesBehind > this.MAXIMUM_PATCHES_BEHIND;
    }

    /**
     * It checks constants object
     * @returns {boolean} Returns true, if the constants object has correct data and false - otherwise.
     */
    _isConstantsValid() {
        /**
         * It checks patch object
         * @param {Object} patch patch object 
         * @returns {boolean} Returns true, if the patch object has correct data and false - otherwise.
         */
        function isPatchValid(patch) {
            return !(patch === undefined || typeof patch.minimum !== 'number' || typeof patch.maximum !== 'number' ||
                patch.minimum > 0 || patch.maximum > 0 || patch.minimum > patch.maximum);
        }

        return !(this._constants === undefined || this._constants.patches === undefined ||
            typeof this._constants.maximumNumberOfLanes !== 'number' ||
            this._constants.maximumNumberOfLanes < 0 || this._constants.maximumNumberOfLanes > 100 |
            typeof this._constants.straightProbability !== 'number' ||
            this._constants.straightProbability < 0 || this._constants.straightProbability > 1 ||
            typeof this._constants.safeDistance !== 'number' ||
            this._constants.safeDistance < 0 ||
            !isPatchValid(this._constants.patches.ahead) || !isPatchValid(this._constants.patches.behind) ||
            this._constants.patches.ahead.minimum + this._constants.patches.behind.minimum <= this._constants.safeDistance);
    }

    /*
     * It generates cars
     * @private
     * @param {number} patchesAhead patches ahead the user's car
     * @param {number} patchesBehind patches behind the user's car
     * @return {Array} Returns a jagged array with generated cars
     */
    _generateCars(patchesAhead, patchesBehind) {
        let traffic = new Array(this._numberOfLanes);
        //let min = (patchesAhead + patchesBehind) / (5 * this.SAFE_DISTANCE) + 1;
        //let max = (patchesAhead + patchesBehind) / this.SAFE_DISTANCE - min;
        traffic.forEach((lane, laneNumber) => {
            lane = [];
            //TODO: adding cars
            lane.push({
                car: new Car(false, getRandomInt(Car.MIN_SPEED, Car.MAX_SPEED), Direction.generate(this.STRAIGHT_PROBABILITY)),
                lane: laneNumber,
                distance: getRandomInt(patchesAhead, patchesAhead - this.SAFE_DISTANCE * i)
            });
        });
        return traffic;
    }
}