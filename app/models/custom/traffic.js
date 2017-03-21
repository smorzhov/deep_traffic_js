'use strict';

import Car from './car';
import Direction from './direction';
import SpeedGenerator from './speedGenerator';
import { getRandomInt } from './../../utils/random';
import { readFileSync } from './../../utils/io';

export default class Traffic {
    /**
     * Highway traffic constructor
     * @constructor
     * @throws It throws error if the given parameters have incorrect data or if traffic_constant.json file has not been found.
     */
    constructor() {
        this._constants = readFileSync('./constants.json', 'utf8');
        if (!this._isTrafficConstantsValid(this._constants.traffic)) {
            throw new Error('constants.json has incorrect traffic data!');
        }
        this._speedGenerator = new SpeedGenerator(this._constants.speedPatchRatio);
    }

    get NUMBER_OF_LANES() { return this._constants.traffic.numberOfLanes; }

    /**
     * Minimum patches ahead. It also defines the highway size that will be shown to the user.
     */
    get MINIMUM_PATCHES_AHEAD() { return this._constants.traffic.patches.ahead.minimum; }

    get MAXIMUM_PATCHES_AHEAD() { return this._constants.traffic.patches.ahead.maximum; }

    /**
     * Minimum patches behind. It also defines the highway size that will be shown to the user.
     */
    get MINIMUM_PATCHES_BEHIND() { return this._constants.traffic.patches.behind.minimum; }

    get MAXIMUM_PATCHES_BEHIND() { return this._constants.traffic.patches.behind.maximum; }

    get SAFE_DISTANCE() { return this._constants.traffic.safeDistance; }

    get STRAIGHT_PROBABILITY() { return this._constants.traffic.straightProbability; }

    get CAR_SIZE() { return this._constants.traffic.carSize; }

    /**
     * It generates traffic
     * @param {number} patchesAhead patches ahead the user's car
     * @param {number} patchesBehind patches behind the user's car
     */
    generate(patchesAhead = 1, patchesBehind = 0) {
        this._patchesAhead = parseInt(patchesAhead);
        this._patchesBehind = parseInt(patchesBehind);
        this._validateParams();
        /**
         * User's car will be like a center of coordinate system where X-axis means lanes and Y-axis means distance in meters.
         * User's car distance must always be equal to 0. Therefore cars that are behind user's car will have negative distance
         * and cars that are ahead - positive distance.
         */
        this._usersCar = {
            car: new Car(true, this._speedGenerator.MAXIMUM_SPEED, new Direction(1, 0, 0)),
            lane: getRandomInt(0, this.NUMBER_OF_LANES),
            patch: 0
        };
        [this._cars, this._state] = this._generateCars(
            this._patchesAhead < this.MINIMUM_PATCHES_AHEAD ? this.MINIMUM_PATCHES_AHEAD : this._patchesAhead,
            this._patchesBehind < this.MINIMUM_PATCHES_BEHIND ? this.MINIMUM_PATCHES_BEHIND : this._patchesBehind
        );
    }

    /**
     * It updates generated traffic and added new cars if necessary. 
     * @return {Array} Returns state
     */
    update() {
        if (this._usersCar === undefined || this._cars === undefined || this._state === undefined) {
            this.generate();
            return this.state;
        }
        /**
         * TODO. 
         * На основе одномерного массива обновить расположение машин в одномерном массиве и в Map.
         * Если хотя бы часть машины скрылась за пределами экрана, то машина удаляется из массива и из Map.
         * Добавление новых машин должно осуществляться случайным образом. 
         * Если скорость новой машины меньше, чем скорость пользовательской машины, то новая добавляется сверху, 
         * так как далее она будет ехать вниз. 
         * Если скорость новой машины больше скорости пользовательской машины, то новая машина добавляется внизу, 
         * так как далее она будет ехать вверх. 
         */
    }

    /**
     * It validates the params. If they have incorrect value it assygnes default values.
     * @private
     */
    _validateParams() {
        if (isNaN(this.patchesAhead) || this._patchesAhead < 1) {
            this.patchesAhead = 1;
        }
        if (isNaN(this._patchesBehind) || this._patchesBehind < 1) {
            this._patchesBehind = 0;
        }
        if (this._patchesAhead > this.MAXIMUM_PATCHES_AHEAD) {
            this._patchesAhead = this.MAXIMUM_PATCHES_AHEAD;
        }
        if (this._patchesBehind > this.MAXIMUM_PATCHES_BEHIND) {
            this._patchesBehind = this.MAXIMUM_PATCHES_BEHIND;
        }
    }

    /**
     * It checks constants object
     * @private
     * @param {Object} traffic traffic object
     * @returns {boolean} Returns true, if the constants object has correct data and false - otherwise.
     */
    _isTrafficConstantsValid(traffic) {
        /**
         * It checks patch object
         * @param {Object} patch patch object 
         * @returns {boolean} Returns true, if the patch object has correct data and false - otherwise.
         */
        function isPatchValid(patch) {
            return !(patch === undefined || typeof patch.minimum !== 'number' || typeof patch.maximum !== 'number' ||
                patch.minimum > 0 || patch.maximum > 0 || patch.minimum > patch.maximum);
        }

        return !(traffic === undefined || traffic.patches === undefined ||
            typeof traffic.numberOfLanes !== 'number' ||
            traffic.numberOfLanes < 1 || traffic.maximumNumberOfLanes > 100 |
            typeof traffic.straightProbability !== 'number' ||
            traffic.straightProbability < 0 || traffic.straightProbability > 1 ||
            typeof traffic.carSize !== 'number' ||
            traffic.carSize < 0 ||
            typeof traffic.safeDistance !== 'number' ||
            traffic.safeDistance < 0 ||
            !isPatchValid(traffic.patches.ahead) || !isPatchValid(traffic.patches.behind) ||
            traffic.patches.ahead.minimum + traffic.patches.behind.minimum <= traffic.safeDistance ||
            traffic.patches.ahead.minimum + traffic.patches.behind.minimum > traffic.carSize);
    }

    /**
     * It generates cars and saves them into Map
     * @private
     * @param {number} patchesAhead patches ahead the user's car
     * @param {number} patchesBehind patches behind the user's car
     * @return {Array} Returns an array contains Map with generated cars an array represents the current state
     */
    _generateCars(patchesAhead, patchesBehind) {
        /**
         * With big arrays it is much faster that
         * let state = new Array(size);
         */
        let state = [];
        state.length = (this._patchesAhead + this._patchesBehind) * this.NUMBER_OF_LANES;
        let traffic = new Map();
        let maximumDistance = (patchesAhead + patchesBehind) / 3;
        let i = 10;
        for (let laneNumber = 0; laneNumber < this.NUMBER_OF_LANES; laneNumber++) {
            let distance;
            let stop = false;
            while (!stop) {
                let max = distance === undefined ?
                    getRandomInt(patchesAhead, patchesAhead - maximumDistance) - this.SAFE_DISTANCE :
                    distance - this.SAFE_DISTANCE;
                let min = max - maximumDistance;
                if (laneNumber === this._usersCar.lane && this._usersCar.distance < max && this._usersCar.distance > min) {
                    /**We're adding the user's car */
                    traffic.set('user', this._usersCar);
                    this._putCarIntoStateArray(state, 'user', this._usersCar.lane, this._usersCar.patch);
                    distance = 0;
                    continue;
                }
                if (min < -patchesBehind + this.CAR_SIZE) {
                    min = -patchesBehind + this.CAR_SIZE;
                    stop = true;
                }
                if (Math.abs(max - min) <= this.CAR_SIZE) {
                    break;
                }
                distance = getRandomInt(max, min);
                this._putCarIntoStateArray(state, i, laneNumber, distance);
                traffic.set(
                    i++,
                    {
                        car: new Car(false, this._speedGenerator.generate(), Direction.generate(this.STRAIGHT_PROBABILITY)),
                        lane: laneNumber,
                        distance: distance
                    }
                );
            }
        }
        return [traffic, state];
    }

    /**
     * It puts the car into the state array
     * @private
     * @param {Array} state array represents current state 
     * @param {any} carId car id 
     * @param {number} lane car's lane number 
     * @param {number} patch car's patch number 
     */
    _putCarIntoStateArray(state, carId, lane, patch) {
        for (let i = 0; i < this.CAR_SIZE; i++) {
            state[this._stateIndexOf(patch - i, lane)] = carId;
        }
    }

    /**
     * It converts (patch; lane) coordinate into 1d state coordinate
     * @private
     * @param {number} patch patch number 
     * @param {number} lane lane number
     * @return {number} Returns 1d state coordinate
     */
    _stateIndexOf(patch, lane) {
        return patch * this.NUMBER_OF_LANES + lane;
    }
}