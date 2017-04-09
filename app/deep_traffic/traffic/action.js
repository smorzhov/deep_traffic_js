'use strict';

/**
 * It converts number to action string ('forward', 'backward', 'left', 'right', 'none')
 * @param {any} num_action number or string that shows action
 * @return {any} Returns string or number representation of action
 */
export default function getAction(num_action) {
    if (num_action === 0) { return 'forward'; }
    if (num_action === 1) { return 'backward'; }
    if (num_action === 2) { return 'left'; }
    if (num_action === 3) { return 'right'; }
    if (typeof num_action === 'string') {
        num_action = num_action.toLowerCase();
    } else {
        //All remaining cases denote 'none' action
        return 'none';
    }
    if (num_action === 'forward') { return 0; }
    if (num_action === 'backward') { return 1; }
    if (num_action === 'left') { return 2; }
    if (num_action === 'right') { return 3; }
    return 4;
}