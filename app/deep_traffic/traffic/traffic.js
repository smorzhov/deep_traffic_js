'use strict';

import Car from './car';
import Direction from './direction';
import SpeedGenerator from './speedGenerator';
import { getRandomInt } from './../../utils/random';
import { readFileSync } from './../../utils/io';
import getAction from './action';

export default class Traffic {
    /**
     * Highway traffic constructor
     * @constructor
     * @throws It throws error if the given parameters have incorrect data or if traffic_constant.json file has not been found.
     */
    constructor() {
        let constants = readFileSync('./app/deep_traffic/traffic/constants.json', 'utf8');
        this._constants = JSON.parse(constants);
        let traffic = this._constants.traffic;
        if (!this._isTrafficConstantsValid(traffic)) {
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

    get cars() { return this._cars; }

    get overtakenCars() { return this._overtakenCars; }

    /**
     * It generates traffic
     * @param {number} patchesAhead patches ahead the user's car
     * @param {number} patchesBehind patches behind the user's car
     */
    generate(patchesAhead = 1, patchesBehind = 0, lanesSide = 0) {
        this._patchesAhead = parseInt(patchesAhead);
        this._patchesBehind = parseInt(patchesBehind);
        this._lanesSide = parseInt(lanesSide);
        this._validateParams();
        /**
         * User's car will be like a center of coordinate system where X-axis means lanes and Y-axis means distance in meters.
         * User's car distance must always be equal to 0. Therefore cars that are behind user's car will have negative distance
         * and cars that are ahead - positive distance.
         */
        this._overtakenCars = 0; //Number of cars being overtaken by the user's car. It may be negative
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
     * @param {number} action user's car next action (forward, back, left, right, none)
     * @return {Object} Returns result object {action: , overtakenCars: , speed: }
     */
    update(action = 4) {
        let result = {
            action: 'none',     //Action that will be REALLY performed by the user's car after update method
            overtakenCars: 0,   //Number of cars being overtaken by the user's car on this iteration (it is not the this.overtakenCars)
            speed: -1           //user's car speed
        };
        if (this._usersCar === undefined || this._cars === undefined || this._state === undefined) {
            this.generate();
            result.speed = this._usersCar.car.speed.speed;
            return result;
        }
        result.action = this._updateTraffic(getAction(action));
        result.speed = this._usersCar.car.speed.speed;
        result.overtakenCars = this._overtakenCars;
        return result;
    }

    /**
     * @return {Array} Returns 1d array contains traffic info
     */
    trafficToLine() {
        let lanesBegin = this._usersCar.lane - this._lanesSide < 0 ?
            0 :
            this._usersCar.lane - this._lanesSide;
        let lanesEnd = this._usersCar.lane + this._lanesSide > this.NUMBER_OF_LANES ?
            this.NUMBER_OF_LANES :
            this._usersCar.lane + this._lanesSide;
        let ahead = this._getPatchesAheadToLine();
        let behind = this._getPatchesBehindToLine();
        let trafficAsLine = [];
        for (let j = lanesBegin; j < lanesEnd; j++) {
            for (let i = ahead; i < behind; i++) {
                trafficAsLine[j * (ahead + behind) + i] = this._state[i][j];
            }
        }
        return trafficAsLine;
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
        if (isNaN(this._lanesSide) || this._lanesSide < 0 || this._lanesSide > this.NUMBER_OF_LANES) {
            this._lanesSide = 0;
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
                patch.minimum < 0 || patch.maximum < 0 || patch.minimum > patch.maximum);
        }

        return !(traffic === undefined || traffic.patches === undefined ||
            typeof traffic.numberOfLanes !== 'number' ||
            traffic.numberOfLanes < 1 || typeof traffic.straightProbability !== 'number' ||
            traffic.straightProbability < 0 || traffic.straightProbability > 1 ||
            typeof traffic.carSize !== 'number' ||
            traffic.carSize < 0 ||
            typeof traffic.safeDistance !== 'number' ||
            traffic.safeDistance < 0 ||
            !isPatchValid(traffic.patches.ahead) || !isPatchValid(traffic.patches.behind) /*||
      traffic.patches.ahead.minimum + traffic.patches.behind.minimum <= traffic.safeDistance ||
      traffic.patches.ahead.minimum + traffic.patches.behind.minimum > traffic.carSize*/);
    }

    /**
     * It generates cars and saves them into Map
     * @private
     * @param {number} patchesAhead patches ahead the user's car
     * @param {number} patchesBehind patches behind the user's car
     * @return {Array} Returns an array contains Map with generated cars and array represents the current state
     */
    _generateCars(patchesAhead, patchesBehind) {
        /**
         * With big arrays it is much faster that
         * let state = new Array(size);
         */
        let state = [];
        state.length = this.NUMBER_OF_LANES;
        this._newCarProbability = 0.2;
        let traffic = new Map();
        let maximumDistance = (patchesAhead + patchesBehind) / 3;
        let id = 10;
        for (let laneNumber = 0; laneNumber < this.NUMBER_OF_LANES; laneNumber++) {
            let lane = [];
            lane.length = patchesAhead + patchesBehind;
            state[laneNumber] = lane;
            if (laneNumber === this._usersCar.lane) {
                /**We're adding the user's car */
                traffic.set('user', this._usersCar);
                this._putCarIntoStateArray(state, 'user', this._usersCar.lane, this._usersCar.patch);
            } else {
                let distance;
                let stop = false;
                while (!stop) {
                    let max = distance === undefined ?
                        getRandomInt(patchesAhead, patchesAhead - maximumDistance) - this.SAFE_DISTANCE :
                        distance - this.SAFE_DISTANCE - this.CAR_SIZE - this.CAR_SIZE;
                    let min = max - maximumDistance;
                    if (min < -patchesBehind + this.CAR_SIZE) {
                        min = -patchesBehind + this.CAR_SIZE;
                        stop = true;
                    }
                    if (Math.abs(max - min) <= this.CAR_SIZE) {
                        break;
                    }
                    distance = getRandomInt(max, min);
                    this._putCarIntoStateArray(state, id, laneNumber, distance);
                    traffic.set(
                        id++,
                        {
                            car: new Car(false, this._speedGenerator.generate(), Direction.generate(this.STRAIGHT_PROBABILITY)),
                            lane: laneNumber,
                            distance: distance
                        }
                    );
                }
            }
        }
        this._newCarId = id + 1;
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
            //state[patch - i][lane] = carId;
            state[lane][patch - i] = carId;
        }
    }

    _getPatchesAheadToLine() {
        return this._patchesAhead < this.MINIMUM_PATCHES_AHEAD ? this._patchesAhead : this.MINIMUM_PATCHES_AHEAD;
    }

    _getPatchesBehindToLine() {
        return this._patchesBehind < this.MINIMUM_PATCHES_BEHIND ? - this._patchesBehind : - this.MINIMUM_PATCHES_BEHIND;
    }

    _patchBegin(curPatch, patchesToMove) {
        return (curPatch + patchesToMove + this.SAFE_DISTANCE > this.patchesAhead) ? this.patchesAhead : curPatch + patchesToMove + this.SAFE_DISTANCE;
    }

    _patchEnd(curPatch, patchesToMove) {
        return (curPatch + patchesToMove - this.CAR_SIZE < this._patchesBehind) ? this.patchesAhead : curPatch + patchesToMove - this.CAR_SIZE;
    }

    _moveCar(patchesToMove, lane, curPatch) {
        if (patchesToMove === 0) {
            return;
        }
        for (let i = 0; i < this.CAR_SIZE; i++) {
            this._state[lane][curPatch + patchesToMove - i] = this._state[lane][curPatch - i];
        }
        // теперь нужно за собой убрать

        let patchesBegin = curPatch;
        let patchesEnd = curPatch - this.CAR_SIZE;
        if (patchesToMove > 0) {
            patchesBegin = curPatch + patchesToMove;
        }
        else {
            patchesEnd = curPatch + patchesToMove;
        }
        for (let i = patchesBegin; i > patchesEnd; i--) {
            this._state[lane][i] = 0;
        }
        this._checkOvertakenCars(curPatch, curPatch + patchesToMove);
    }

    _getPatchesAheadToMap() {
        return this._patchesAhead > this.MINIMUM_PATCHES_AHEAD ? this._patchesAhead : this.MINIMUM_PATCHES_AHEAD;
    }

    _getPatchesBehindToMap() {
        return this._patchesBehind > this.MINIMUM_PATCHES_BEHIND ? - this._patchesBehind : - this.MINIMUM_PATCHES_BEHIND;
    }

    _checkPatch(curPatch) {
        if (curPatch === undefined || curPatch >= this._getPatchesAheadToMap() || curPatch <= this._getPatchesBehindToMap()) {
            return false;
        }
        else {
            return true;
        }
    }

    _checkAheadDirection(patch, lane, patchesSpeed) {
        let patchBegin = patch + patchesSpeed + this.SAFE_DISTANCE + 1;
        if (!this._checkPatch(patchBegin)) {
            return 'OutOfPatch';
        }
        for (let i = patch + 1; i < patch + this.SAFE_DISTANCE + 1; i++) {
            if (this._state[lane][i] !== 0 && this._state[lane][i] !== undefined) {
                return 'NotSafeDistance';
            }
        }
        for (let i = patch + this.SAFE_DISTANCE + 1; i < patchBegin + 1; i++) {
            if (this._state[lane][i] !== 0 && this._state[lane][i] !== undefined) {
                return 'OnlySafeDistance';
            }
        }
        return 'OK';
    }

    _checkBehindDirection(patch, lane, patchesSpeed) {
        // сзади всегда не меньше, чем safe distance патчей
        if (!this._checkPatch(patch + patchesSpeed)) {
            return "OutOfPatch";
        }
        for (let i = patch + 1; i < patch + this.SAFE_DISTANCE + 1; i++) {
            if (this._state[lane][i] !== 0 && this._state[lane][i] !== undefined) {
                return 'NotSafeDistance';
            }
        }
        return "OK";
    }

    _findCarAheadSpeed(patch, lane) {
        let patchesBegin = patch + 1;
        let patchesEnd = patchesBegin + this.SAFE_DISTANCE + 1;
        for (let i = patchesBegin; i < patchesEnd; i++) {
            if (this._state[lane][i] !== 0 && this._state[lane][i] !== undefined) {
                return this._cars.get(this._state[lane][i]).car.speed;
            }
        }
    }

    _deleteCar(patch, lane, carID) {
        this._cars.delete(carID);
        for (let i = patch; i > patch - this.CAR_SIZE; i--) {
            this._state[lane][i] = 0;
        }
        this._newCarProbability = 0.8;
    }

    _moveAhead(patch, lane, patchesSpeed, carID) {
        let result = this._checkAheadDirection(patch, lane, patchesSpeed);
        if (result === 'OK') {
            if (patchesSpeed !== 0) {
                this._moveCar(patchesSpeed, lane, patch);
                this._cars.get(carID).distance += patchesSpeed;
                this._cars.get(carID).car.changeSpeed();
            }
            this._alreadyUpdatedCars.set(carID, true);
        }
        else if (result === 'OutOfPatch') {
            this._deleteCar(patch, lane, carID);
        }
        else if (result === 'NotSafeDistance' || result === 'OnlySafeDistance') {
            // ищем скорость машину перед этой
            let newSpeed = this._findCarAheadSpeed(patch, lane);
            let userPatchesSpeed = this._usersCar.car.speed.patches;
            let newSpeedPatches = newSpeed.patches;
            this._cars.get(carID).car.changeSpeed(newSpeed);
            // а теперь сдивинемся назад
            this._moveBehind(patch, lane, newSpeedPatches - userPatchesSpeed, carID);
        }
    }

    _moveBehind(patch, lane, patchesSpeed, carID) {
        let result = this._checkBehindDirection(patch, lane, patchesSpeed);
        if (result === 'OK') {
            // сдигаем машину
            this._moveCar(patchesSpeed, lane, patch);
            this._cars.get(carID).distance += patchesSpeed;
            this._alreadyUpdatedCars.set(carID, true);
        }
        else if (result === 'NotSafeDistance' || result === 'OnlySafeDistance') {
            // ищем скорость машину перед этой
            let newSpeed = this._findCarAheadSpeed(patch, lane);
            let userPatchesSpeed = this._usersCar.car.speed.patches;
            let newSpeedPatches = newSpeed.patches;
            if (this._checkPatch(patch + newSpeedPatches - userPatchesSpeed)) {
                this._cars.get(carID).car.changeSpeed(newSpeed);
                this._moveCar(newSpeedPatches - userPatchesSpeed, lane, patch);
                this._cars.get(carID).distance += (newSpeedPatches - userPatchesSpeed);
                this._alreadyUpdatedCars.set(carID, true);
            }
            else {
                this._deleteCar(patch, lane, carID);
            }
        }
        else if (result === 'OutOfPatch') {
            // TODO
            this._deleteCar(patch, lane, carID);
        }
    }

    _checkNewDirection(patch, lane, speed, direction) {
        if (direction === 'left') {
            lane--;
        }
        else if (direction === 'right') {
            lane++;
        }
        else {
            return false;
        }
        if (lane < 0 || lane >= this.NUMBER_OF_LANES) {
            return false;
        }
        // откуда будем смотреть
        let distanceBegin = patch + this.SAFE_DISTANCE + speed;
        if (!this._checkPatch(distanceBegin)) {
            return false;
        }
        //до куда будем смотреть
        let distanceEnd = distanceBegin - 2 * this.SAFE_DISTANCE - this.CAR_SIZE;
        if (!this._checkPatch(distanceEnd)) {
            return false;
        }
        for (let i = distanceBegin; i > distanceEnd; i--) {
            if (this._state[lane][i] !== undefined && this._state[lane][i] !== 0) {
                return false;
            }
        }
        return true;
    }

    _moveToNewLine(patch, lane, speed, direction, curID) {
        let newLane = lane;
        if (direction === 'left') {
            newLane--;
        }
        else if (direction === 'right') {
            newLane++;
        }
        // откуда будем обновлять
        let distanceBegin = patch;
        //до куда будем обновлять
        let distanceEnd = distanceBegin - this.CAR_SIZE;
        for (let i = distanceBegin; i > distanceEnd; i--) {
            this._state[newLane][i + speed] = this._state[lane][i];
            this._state[lane][i] = 0;
        }
        this._cars.get(curID).lane = newLane;
        this._cars.get(curID).distance += speed;
        this._cars.get(curID).changeLane = true;
        this._checkOvertakenCars(patch, patch + speed);
    }

    _checkAndMoveCar(patch, lane, carID) {
        // на сколько сдвинется машина пользователя
        let userPatchesSpeed = this._usersCar.car.speed.patches;
        let curCar = this._cars.get(carID);
        // если текущей машины вдруг нет в map, то нужно почистить поле движения
        if (curCar === undefined) {
            // TODO
            // ПОЧИСТИТЬ ПОЛЕ ДВИЖЕНИЯ
        }
        // сменим скорость обратно
        // this._cars.get(carID).car.changeSpeed();
        // на сколько должна сдвинуться текущая машина
        let curPatchesSpeed = curCar.car.speed.patches;
        let newDirection = curCar.car.direction;
        // проверям, можем ли перестроиться на новую полосу
        if (newDirection === 'left' || newDirection === 'right') {
            let canMove = this._checkNewDirection(patch, lane, curPatchesSpeed - userPatchesSpeed, newDirection);
            if (canMove === true) {
                this._moveToNewLine(patch, lane, curPatchesSpeed - userPatchesSpeed, newDirection, carID);
                this._alreadyUpdatedCars.set(carID, true);
                return;
            }
        }
        // теперь едем прямо
        if (curPatchesSpeed - userPatchesSpeed >= 0) {
            this._moveAhead(patch, lane, curPatchesSpeed - userPatchesSpeed, carID);
        }
        else {
            this._moveBehind(patch, lane, curPatchesSpeed - userPatchesSpeed, carID);
        }
    }

    _checkOvertakenCars(oldPatch, newPatch) {
        if (oldPatch <= 0 && newPatch > 0) {
            this._overtakenCars--;
        }
        else if (oldPatch >= 0 && newPatch < 0) {
            this._overtakenCars++;
        }
    }

    _checkUserCarDirection(lane, userSpeed) {
        for (let i = 1; i < this.SAFE_DISTANCE + 1; i++) {
            let curId = this._state[lane][i + this.SAFE_DISTANCE];
            if (curId !== 0 || curId !== undefined) {
                let curSpeed = this._cars.get(curId).car.speed.patch;
                if (curSpeed - userSpeed < - i) {
                    return 'back';
                }
                else if (curSpeed - userSpeed > i) {
                    return 'forward';
                }
                else {
                    return 'none';
                }
            }
        }
    }

    /**
     *
     * @param action - направление движения машины
     * @private реально выполненое действие
     */
    _moveUserCar(action) {
        // смотрим, что нам предлагают выполнить
        if (action === 'left' || action === 'right') {
            if (this._checkNewDirection(0, this._usersCar.lane, 0, action)) {
                this._moveToNewLine(0, this._usersCar.lane, 0, action, 'user');
                this._usersCar.lane = this._cars.get('user').lane;
                return action;
            }
        }
        let newSpeed = this._speedGenerator.getNewSpeed(this._usersCar.car.speed.speed, true);
        if (newSpeed === undefined) {
            return 'none';
        }
        let checkDirection = this._checkUserCarDirection(this._usersCar.lane, newSpeed.patch);
        // теперь попробуем ускорится
        if (checkDirection === 'forward') {
            this._usersCar.car.speed = newSpeed;
            this._cars.get('user').car.changeSpeed(newSpeed.speed);
            return 'forward';
        }
        else if (checkDirection === 'back') {
            let lessSpeed = this._speedGenerator.getNewSpeed(this._usersCar.car.speed.speed, true);
            if (lessSpeed === undefined) {
                return 'none';
            }
            this._usersCar.car.speed = lessSpeed;
            this._cars.get('user').car.changeSpeed(lessSpeed.speed);
            return 'back';
        }
        else {
            return 'none';
        }
    }

    /**
     * It updates traffic
     * @param {string} action user's car next action (forward, back, left, right, none)
     */
    _updateTraffic(action) {
        let resultAction = this._moveUserCar(action);
        this._overtakenCars = 0;
        // получаем границы для массива
        let patches_ahead = this._getPatchesAheadToMap();
        let patches_behind = this._getPatchesBehindToMap();
        // количество патчей, на которые можем сдвинуться
        let freePatchesToMove = 0;
        // машины, которые уже обновили
        this._alreadyUpdatedCars = new Map();
        this._alreadyUpdatedCars.set('user', true);
        for (let j = 0; j < this.NUMBER_OF_LANES; j++) {
            for (let i = patches_ahead; i > patches_behind; i--) {
                //текущая машина, которую будем обновлять
                let carId = this._state[j][i];
                if (carId === 0 || carId === undefined || carId === 'user') {
                    continue;
                }
                if (this._alreadyUpdatedCars.get(carId) !== undefined) {
                    // уже обновляли эту машину
                    continue;
                }
                this._checkAndMoveCar(i, j, carId, freePatchesToMove);
            }
        }
        this._generateCarsOnUpdate();
        return resultAction;
    }

    _getPatchesAhead() {
        return this._patchesAhead < this.MINIMUM_PATCHES_AHEAD ? this._patchesAhead : this.MINIMUM_PATCHES_AHEAD;
    }

    _getPatchesBehind() {
        return this._patchesBehind < this.MINIMUM_PATCHES_BEHIND ? this._patchesBehind : this.MINIMUM_PATCHES_BEHIND;
    }

    _checkLaneToNewCar(patch, lane) {
        for (let i = patch; i > patch - this.CAR_SIZE - this.SAFE_DISTANCE; i--) {
            let cur = this._state[lane][i];
            if (this._state[lane][i] !== 0 && this._state[lane][i] !== undefined) {
                return false;
            }
        }
        return true;
    }

    _generateCarsOnUpdate() {
        // генерируем только когда число машин меньше какого-то числа
        if (this._newCarProbability > Math.random()) {
            // генерируем новую машину
            let car = new Car(false, this._speedGenerator.generate(), Direction.generate(this.STRAIGHT_PROBABILITY));
            let patchBegin = this._getPatchesAheadToMap();
            if (car.speed > this._usersCar.car.speed) {
                patchBegin = this._getPatchesBehindToMap() + this.CAR_SIZE + this.SAFE_DISTANCE;
            }
            // пытаемся найти для машины полосу
            let updateTryCount = 0;
            let lane = getRandomInt(0, this.NUMBER_OF_LANES);
            let find = false;
            while (updateTryCount < this.NUMBER_OF_LANES && find === false) {
                updateTryCount++;
                if (!(this._checkLaneToNewCar(patchBegin, lane))) {
                    // будем искать полосу
                    lane = getRandomInt(0, this.NUMBER_OF_LANES);
                }
                else {
                    find = true;
                }
            }
            if (find === false) {
                // не нашли
                return;
            }
            this._newCarProbability = 0.2;
            // нашли. Добавим
            let id = this._newCarId;
            this._newCarId++;
            this._cars.set(
                id,
                {
                    car: car,
                    lane: lane,
                    distance: patchBegin
                }
            );
            this._putCarIntoStateArray(this._state, id, lane, patchBegin);
        }
    }
}
