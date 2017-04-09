'use strict';

import vm from 'vm';
import convnetjs from 'npm:convnetjs';

export default class Agent {
    /**
     * Agent constrictor
     * @constructor
     */
    constructor() {
        this._brain = null;
        this._trainIterations = 10000;
        this._sandbox = {
            patchesAhead: 1,
            patchesBehind: 0,
            lanesSide: 0,
            trainIterations: 10000,
            brain: null,
            deepqlearn: convnetjs.deepqlearn
        };
    }

    /**
     * It initializes class variables
     * @param {string} code JS code that will be ran in the sandox to initialize some variables 
     */
    initialize(code) {
        vm.createContext(this._sandbox);
        vm.runInContext(code, this._sandbox);
        this._brain = this._sandbox.brain || {};
        if (!(typeof this._brain.forward === 'function' && typeof this._brain.backward === 'function')) {
            //TODO: do something
        }
        if (typeof this._sandbox.trainIterations === 'number' && this._sandbox.trainIterations > 0) {
            this._trainIterations = this._sandbox.trainIterations;
        }
    }

    /**
     * 
     * @param {Array} traffic traffic array for neural network 
     * @return {number} number of action
     */
    forward(traffic) {
        return this._brain.forward(traffic);
    }

    /**
     * 
     * @param {number} reward action's reward
     */
    backward(reward) {
        this._brain.backward(reward);
    }
}