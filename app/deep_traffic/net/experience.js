'use strict';

export default class Experience {
    /**
     * Experience constructor
     * @constructor
     * @param {Object} currentState agent's state
     * @param {Object} currentAction agent's action
     * @param {Object} currentReward reward
     * @param {Object} nextState new agent's state
     */
    constructor(currentState, currentAction, currentReward, nextState) {
        this._currentState = currentState;
        this._currentAction = currentAction;
        this._currentReward = currentReward;
        this._nextState = nextState;
    }

    get currentState() { return this._currentState; }

    set currentState(state) { this._currentState = state; }

    get currentAction() { return this._currentAction; }

    set currentAction(action) { this._currentAction = action; }

    get currentReward() { return this._currentReward; }

    set currentReward(reward) { this._currentReward = reward; }

    get nextState() { return this._nextState; }

    set nextState(state) { this._nextState = state; }
}