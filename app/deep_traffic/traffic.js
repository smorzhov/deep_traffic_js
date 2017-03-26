'use strict';

import Car from './car';
import Direction from './direction';
import SpeedGenerator from './speedGenerator';
import { getRandomInt } from './utils/random';
import { readFileSync } from './utils/io';

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
         * Если скорость новой машины больше скорости пользовательской машины, то новая машина добавляется cнизу,
         * так как далее она будет ехать вверх.
         */
        this._updateTraffic();
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
     * @return {Array} Returns an array contains Map with generated cars and array represents the current state
     */
    _generateCars(patchesAhead, patchesBehind) {
        /**
         * With big arrays it is much faster that
         * let state = new Array(size);
         */
        let state = [];
        state.length = this.NUMBER_OF_LANES;
        let traffic = new Map();
        let maximumDistance = (patchesAhead + patchesBehind) / 3;
        let id = 10;
        state.forEach((lane, laneNumber) => {
            lane = [];
            lane.length = patchesAhead + patchesBehind;
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
                        distance - this.SAFE_DISTANCE;
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
        });
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
            state[patch - i][lane] = carId;
        }
    }

    /**
     *
     */
    _updateTraffic() {
        //Ты нигде это не заполняешь.
        let alreadyUpdatedCars = new Map();
        let patchesCounter = this._patchesAhead + this._patchesBehind;
        let prevCarID = 0;
        // идем по столбцам
        for (let j = 0; j < this.NUMBER_OF_LANES; j++) {
            // количество свободных патчей для движения
            let patchesFree = 0;
            for (let i = 0; i < patchesCounter; i++) {
                // получаем текущий элемент дороги
                let carID = this._state[i][j];
                if (carID === 0 || carID === undefined) {
                    patchesFree++;
                }
                else if (carID > 2) {
                    if (alreadyUpdatedCars.get(carID) === undefined) {
                        // еще не обновляли для этой машины - обновим
                        this._updateDataToCar();
                        prevCarID = carID;
                        patchesFree = 0;
                    }
                }
            }

        }
    }

    /**
     * Обновить данные для машины
     * @param {number} carID текущий ID
     * @param {number} prevID предыдущий ID
     * @param {number} x координата по x
     * @param {number} y координата по y
     * @param {number} patchesFree количество патчей, которые свободны
     */
    _updateDataToCar(carID, prevID, x, y, patchesFree) {
        // получаем скорость машины
        let IDObject = this._traffic.get(carID);
        if (IDObject === undefined) {
            // удаляем
            return;
        }
        // сначала в любом случае движемся вперед на количество патчей,
        // на которое можно сдвинуться
        let patchesToMove = this.getPatchesToMove(IDObject.car.speed);
        if (patchesToMove > patchesFree) {
            // сдвигаемся на свободное количество патчей
            this._updateCard(x, y, patchesFree);
            // устанавливаем скорость для текущей машины
            let IDObjectPrev = this._traffic.get(prevID);
            if (IDObjectPrev === undefined) {
                // удаляем
                return;
            }
            IDObject.car.changeSpeed(IDObjectPrev.car.speed);
            IDObject.distance += patchesFree;
        }
        else {
            // сдвигаем на количество патчей
            this._updateCard(x, y, patchesToMove);
            IDObject.distance += patchesToMove;
            // возвращаем скорость
            IDObject.car.changeSpeed();
        }
        // возможно нам придется сдвинуться вправо или влево
        let direction = 0;
        if (direction === 'left') {
            direction = -1;
        }
        else if (direction = 'rigth') {
            direction = 1;
        }
        if (this._changeLane(x, y, direction)) {
            IDObject.lane += direction;
        }
        this._traffic.set(carID, IDObject);
    }

    /**
     * Обновить карту для машины
     * @param {number} x координата по x
     * @param {number} y координата по y
     * @param {number} patchesToMove количество патчей, на которые смещаемся
     */
    _updateCard(x, y, patchesToMove) {
        let begin = x - this.SAFE_DISTANCE - patchesToMove;
        if (begin < 0) {
            begin = 0;
        }
        let end = x + this.CAR_SIZE - patchesToMove;
        for (let i = begin; i < end; i++) {
            this._state[x][y] = this._state[x][y + patchesToMove];
        }
        for (let i = end; i < end + patchesToMove; i++) {
            this._state[x][y] = 0;
        }
    }
    /**
     * Сменить полосу для машины
     * @param {number} carPatch координата по x
     * @param {number} oldLine координата по y
     * @param {number} direction направление движения
     * @return {boolean} удалось ли сменить полосу
     */
    _changeLane(carPatch, oldLine, direction) {
        // проверяем, можем ли мы сдвинуться на новую полосу
        let newLane = oldLine + direction;
        if (newLane < 0 || newLane > this.NUMBER_OF_LANES - 1) {
            return false;
        }
        // проверяем, свободна ли новая полоса
        if (!this._checkDirection(carPatch, newLane)) {
            return false;
        }
        // если да, то обновляем карту
        this._checkDirection(carPatch, newLane, oldLine);
        return true;
    }
    /**
     * Сменить полосу для машины
     * @param {number} carPatch координата по x
     * @param {number} newLane координата по y
     * @return {boolean} Возвращает - можем ли мы сменить полосу на текущую
     */
    _checkDirection(curPatch, newLane) {
        let begin = curPatch - this.SAFE_DISTANCE;
        if (begin < 0) {
            begin = 0;
        }
        let end = curPatch + 2 * this.CAR_SIZE;
        for (let i = begin; i < end; i++) {
            if (this._state[i][newLane] !== 0 && this._state[i][newLane] !== undefined) {
                return false;
            }
        }
    }

    _getLines(){
      return ( this._lines > this.NUMBER_OF_LANES || this._lines === undefined )? this.NUMBER_OF_LANES : this._lines;
    }

    _getPatchesAhead() {
      return this._patchesAhead < this.MINIMUM_PATCHES_AHEAD ? this._patchesAhead : this.MINIMUM_PATCHES_AHEAD;
    }

    _getPatchesBehind() {
      return this._patchesBehind < this.MINIMUM_PATCHES_BEHIND ?  this._patchesBehind : this.MINIMUM_PATCHES_BEHIND;
    }
    _trafficToLine(){
      let userLines = this._usersCar.lane;
      let linesCount = this._getLines();
      let linesBegin =  this._usersCar.lane - linesCount < 0 ? 0 : this._usersCar.lane - linesCount;
      let linesEnd = this._usersCar.lane + linesCount > this.NUMBER_OF_LANES ? this.NUMBER_OF_LANES : this._usersCar.lane + linesCount;
      let ahead = this._getPatchesAhead();
      let behind = this._getPatchesBehind();
      let trafficAsLine = [];
      for( let j = linesBegin; j < linesEnd; j++ ){
        for( let i = ahead; i < behind; i++) {
          trafficAsLine[j * (ahead + behind) + i] = this._state[i][j];
        }
      }
      return trafficAsLine;
    }

}
