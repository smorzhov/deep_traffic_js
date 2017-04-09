'use strict';

/**
 * It converts number to action string ('forward', 'backward', 'left', 'right', 'none')
 * @param {number} num_action number of action
 * @return {string} Returns string representation of action
 */
export default function getAction(num_action) {
    switch (num_action) {
        case 0:
            return 'forward';
        case 1:
            return 'backward';
        case 2:
            return 'left';
        case 3:
            return 'right';
        default:
            return 'none';
    }
}