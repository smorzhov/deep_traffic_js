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
        this.newCarProbability = 0.2;
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
            state[patch - i][lane] = carId;
        }
    }
    _getPatchesAheadToLine() {
      return this._patchesAhead < this.MINIMUM_PATCHES_AHEAD ? this._patchesAhead : this.MINIMUM_PATCHES_AHEAD;
    }

    _getPatchesBehindToLine() {
      return this._patchesBehind < this.MINIMUM_PATCHES_BEHIND ?  - this._patchesBehind : - this.MINIMUM_PATCHES_BEHIND;
    }
    trafficToLine(){
      let lanesCount = this._getLines();
      let lanesBegin =  this._usersCar.lane - lanesCount < 0 ? 0 : this._usersCar.lane - lanesCount;
      let lanesEnd = this._usersCar.lane + lanesCount > this.NUMBER_OF_LANES ? this.NUMBER_OF_LANES : this._usersCar.lane + lanesCount;
      let ahead = this._getPatchesAheadToLine();
      let behind = this._getPatchesBehindToLine();
      let trafficAsLine = [];
      for( let j = lanesBegin; j < lanesEnd; j++ ){
        for( let i = ahead; i < behind; i++) {
          trafficAsLine[j * (ahead + behind) + i] = this._state[i][j];
        }
      }
      return trafficAsLine;
    }

    _patchBegin( curPatch, patchesToMove ){
      return ( curPatch + patchesToMove + this.SAFE_DISTANCE > this.patchesAhead ) ? this.patchesAhead : curPatch + patchesToMove + this.SAFE_DISTANCE;
    }

    _patchEnd( curPatch, patchesToMove ){
      return ( curPatch + patchesToMove - this.CAR_SIZE  < this._patchesBehind ) ? this.patchesAhead : curPatch + patchesToMove - this.CAR_SIZE;
    }

    _moveCar( patchesToMove, lane, curPatch ){
      if( patchesToMove === 0 ){
        return;
      }
      for( let i = 0; i < this.CAR_SIZE; i++ ){
        this._state[curPatch + patchesToMove - i][lane] = this._state[ curPatch - i][lane];
      }
      // теперь нужно за собой убрать

      let patchesBegin = curPatch;
      let patchesEnd = curPatch - this.CAR_SIZE;
      if( patchesToMove > 0 ){
        patchesBegin = curPatch - patchesToMove;
      }
      else{
        patchesEnd = curPatch + patchesToMove;
      }
      for( let i = patchesBegin; i > patchesEnd; i -- ){
        this._state[i][lane] = 0;
      }
    }
    _getPatchesAheadToMap() {
      return this._patchesAhead > this.MINIMUM_PATCHES_AHEAD ? this._patchesAhead : this.MINIMUM_PATCHES_AHEAD;
    }

    _getPatchesBehindToMap() {
      return this._patchesBehind > this.MINIMUM_PATCHES_BEHIND ?  - this._patchesBehind : - this.MINIMUM_PATCHES_BEHIND;
    }

    _checkPatch(curPatch){
      if( curPatch === undefined || curPatch > this._getPatchesAheadToMap() || curPatch < this._getPatchesBehindToMap()  ){
        return false;
      }
      else{
        return true;
      }
    }

    _checkAheadDirection( patch, lane, patchesSpeed ){
      let patchBegin = patch + patchesSpeed + this.SAFE_DISTANCE;
      if( !this._checkPatch( patchBegin ) ){
        return 'OutOfPatch';
      }
      for( let i = patch; i > patch + this.SAFE_DISTANCE ; i++ ){
        if( this._state[i][lane] !== 0 || this._state[i][lane] !== undefined ){
          return 'NotSafeDistance';
        }
      }
      for( let i = patch + this.SAFE_DISTANCE; i < patchBegin + 1 ; i++ ){
        if( this._state[i][lane] !== 0 || this._state[i][lane] !== undefined ){
          return 'OnlySafeDistance';
        }
      }
      return 'OK';
    }

    _checkBehindDirection( patch, patchesSpeed ){
      // сзади всегда не меньше, чем safe distance патчей
      if(  this._checkPatch( patch + patchesSpeed ) ){
        return "OutOfPatch";
      }
      else{
        return "OK";
      }
    }

    _findCarAheadSpeed( patch, lane ){
      let patchesEnd = patch;
      let patchesBegin = patchesEnd + this.SAFE_DISTANCE;
      for( let i = patchesBegin; i > patchesEnd; i--  ){
        if( this._state[i][lane] !== 0 || this._state[i][lane] !== undefined ){
          return this._cars.get( this._state[i][lane] ).car.speed;
        }
      }
    }

    _deleteCar( patch, lane, patchesSpeed, carID ){
      this._cars.delete( carID );
      for( let i = patch; i > patch - this.CAR_SIZE; i++ ){
        this._state[i][lane] = 0;
      }
      this.newCarProbability = 0.8;
    }
    _moveAhead(patch,lane, patchesSpeed, carID){
      let result = this._checkAheadDirection( patch, lane, patchesSpeed );
      if( result === 'OK' ){
        this._moveCar( patchesSpeed, lane, patch);
        this._car.get( carID ).distance += patchesSpeed;
        this._car.get( carID ).car.changeSpeed();
        this._alreadyUpdatedCars.set( carID, true );
      }
      else if( result === 'OutOfPatch' ){
        this._deleteCar( patch, lane, carID );
      }
      else if( result === 'NotSafeDistance' ||  result === 'OnlySafeDistance' ){
        // ищем скорость машину перед этой
        let newSpeed = this._findCarAheadSpeed( patch, lane );
        let userPatchesSpeed = this.getPatchesToMove(this._usersCar.car.speed);
        let newSpeedPatches = this.getPatchesToMove( newSpeed );
        this._cars.get( carID ).car.changeSpeed( newSpeed );
        // а теперь сдивинемся назад
        this._moveBehind( patch, lane, newSpeedPatches - userPatchesSpeed, carID );
      }
    }

    _moveBehind(patch,lane, patchesSpeed, carID){
      let result = this._checkBehindDirection( patch, lane, patchesSpeed );
      if( result === 'OK' ){
        // сдигаем машину
        this._moveCar( patchesSpeed, lane, patch);
        this._car.get( carID ).distance += patchesSpeed;
        this._alreadyUpdatedCars.set( carID, true );
      }
      else if( result === 'OutOfPatch' ){
        // TODO
        this._deleteCar( patch, lane, carID );
      }
    }
    _checkNewDirection( patch, lane, speed, direction){
      if( direction === 'left' ){
        lane--;
      }
      else if( direction === 'right' ){
        lane++;
      }
      else{
        return false;
      }
      if( lane < 0 || lane >= this.NUMBER_OF_LANES ){
        return false;
      }
      // откуда будем смотреть
      let distanceBegin = patch + this.SAFE_DISTANCE + speed;
      if( !this._checkPatch(distanceBegin) ){
        return false;
      }
      //до куда будем смотреть
      let distanceEnd = distanceBegin - 2*this.SAFE_DISTANCE - this.CAR_SIZE;
      if( !this._checkPatch(distanceEnd) ){
        return false;
      }
      for(let i = distanceBegin; i > distanceEnd; i--){
        if(this._speed[i][lane] !== undefined || this._speed[i][lane] !== 0){
          return false;
        }
      }
      return true;
    }
    _moveToNewLine(patch, lane, speed, direction, curID) {
      let newLane = lane;
      if( direction === 'left' ){
        newLane--;
      }
      else if( direction === 'right' ){
        newLane++;
      }
      // откуда будем обновлять
      let distanceBegin = patch - speed;
      //до куда будем обновлять
      let distanceEnd = distanceBegin + this.CAR_SIZE;
      for(let i = distanceBegin; i >= distanceEnd; i--){
          this._state[i][newLane] = this._state[i+speed][lane];
          this._state[i+speed][lane] = 0;
        }
      this._car.get( curID ).lane = newLane;
      this._car.get( curID ).distance += speed;
    }

    _checkAndMoveCar( patch, lane, carID ) {
      // на сколько сдвинется машина пользователя
      let userPatchesSpeed = this.getPatchesToMove(this._usersCar.car.speed);
      let curCar = this._traffic.get( carID );
      // если текущей машины вдруг нет в map, то нужно почистить поле движения
      if( curCar === undefined ){
        // TODO
        // ПОЧИСТИТЬ ПОЛЕ ДВИЖЕНИЯ
      }
      // сменим скорость обратно
      this._traffic.get( carID ).changeSpeed();
      // на сколько должна сдвинуться текущая машина
      let curPatchesSpeed = this.getPatchesToMove(curCar.car.speed);
      let newDirection = curCar.car.direction;
      // проверям, можем ли перестроится на новую полосу
      if( newDirection === 'left' || newDirection === 'right' ){
        let canMove = this._checkNewDirection( patch, lane, curPatchesSpeed - userPatchesSpeed, newDirection );
        if( canMove === true ){
          this._moveToNewLine( patch, lane, curPatchesSpeed - userPatchesSpeed, newDirection, carID );
          this.alreadyUpdatedCars.set( carID, true );
          return;
        }
      }
      // теперь едем прямо
      if( curPatchesSpeed - userPatchesSpeed === 0 ){
        this.alreadyUpdatedCars.set( carID, true );
      }
      else if( curPatchesSpeed - userPatchesSpeed > 0 ){
        this._moveAhead( patch, lane, curPatchesSpeed - userPatchesSpeed, carID  );
      }
      else{
        this._moveBehind( patch, lane, curPatchesSpeed - userPatchesSpeed, carID );
      }
     }
    _updateTraffic() {
      // TODO
      // СДВИНУТЬ МАШИНУ ПОЛЬЗОВАТЕЛЯ
      // получаем границы для массива
      let patches_ahead = this._getPatchesAheadToMap();
      let patches_behind = this._getPatchesBehindToMap();
      // количество патчей, на которые можем сдвинуться
      let freePatchesToMove = 0;
      // машины, которые уже обновили
      this._alreadyUpdatedCars = new Map();
      for (let j = 0; j < this.NUMBER_OF_LANES; j++) {
        for (let i = patches_ahead; i > patches_behind; i--) {
          //текущая машина, которую будем обновлять
          let curId = this._state[i][j];
          if (curId === 0 || curId === undefined || curId === 'user') {
            continue;
          }
          if (this.alreadyUpdatedCars.get(curId) !== undefined) {
            // уже обновляли эту машину
            continue;
          }
          this._checkAndMoveCar(i, j, curId, freePatchesToMove);
        }
      }
      this._generateCarsOnUpdate();
    }

    _getLines() {
        return (this._lines > this.NUMBER_OF_LANES || this._lines === undefined) ? this.NUMBER_OF_LANES : this._lines;
    }

    _getPatchesAhead() {
        return this._patchesAhead < this.MINIMUM_PATCHES_AHEAD ? this._patchesAhead : this.MINIMUM_PATCHES_AHEAD;
    }

    _getPatchesBehind() {
        return this._patchesBehind < this.MINIMUM_PATCHES_BEHIND ? this._patchesBehind : this.MINIMUM_PATCHES_BEHIND;
    }

    _checkLaneToNewCar(patch, lane){
      for( let i = patch; i > patch - this.CAR_SIZE - this.SAFE_DISTANCE; i -- ){
        if(this._state[i][lane] !== 0 || this._state[i][lane] !== undefined){
          return false;
        }
      }
      return true;
    }
    _generateCarsOnUpdate() {
      // генерируем только когда число машин меньше какого-то числа
      if( this.newCarProbability < Math.random() ) {
        // генерируем новую машину
        let car = new Car(false, this._speedGenerator.generate(), Direction.generate(this.STRAIGHT_PROBABILITY));
        let patchBegin = this._getPatchesAheadToMap();
        if( car.speed > this._usersCar.car.speed ){
          patchBegin = this._getPatchesBehindToMap() + this.CAR_SIZE + this.SAFE_DISTANCE;
        }
        // пытаемся найти для машины полосу
        let updateTryCount = 0;
        let lane = getRandomInt(0, this.NUMBER_OF_LANES);
        while( updateTryCount < this.NUMBER_OF_LANES ){
          updateTryCount++;
          if( this._checkLaneToNewCar(this._getPatchesAheadToMap(), lane) ){
            // будем искать полосу
            lane = getRandomInt(0, this.NUMBER_OF_LANES);
          }
        }
        if( updateTryCount === this.NUMBER_OF_LANES ){
          // не нашли
          return;
        }
        this.newCarProbability = 0.2;
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
