'use strict';

/**
 * It returns a floating point random number that is no lower than (and may possibly equal) min, and is less than (but not equal to) max
 * @param {number} min  
 * @param {number} max 
 * @return {number} returns a random number between the specified values.
 */
export function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * It returns an integer random number that is no lower than min (or the next integer greater than min if min isn't an integer), and is less than (but not equal to) max.
 * @param {number} min 
 * @param {number} max
 * @return {number} returns a random integer between the specified values. 
 */
export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}