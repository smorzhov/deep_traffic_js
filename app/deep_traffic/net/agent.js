'use strict';

import vm from 'vm';

export default class Agent {
    constructor() {
        this._brain = null;
        this._reward_bonus = 0.0;
    }

    assignBrain(code) {
        const sandbox = {};
        vm.createContext(sandbox);
        vm.runInContext(code, sandbox);
        //sandbox now must contain all variables from user's code
    }

    /**
     * In forward pass the agent simply behaves in the environment create input to brain
     */
    forward() {

    }

    /**
     * In backward pass the agent learns
     */
    backward() {

    }
}