'use strict';

/**
 * A window stores _size_ number of values and returns averages. Useful for keeping running 
 * track of validation or training accuracy during SGD
 */
export class Window {
    constructor(size, minsize) {
        this.v = [];
        this.size = typeof (size) === 'undefined' ? 100 : size;
        this.minsize = typeof (minsize) === 'undefined' ? 20 : minsize;
        this.sum = 0;
    }

    add(x) {
        this.v.push(x);
        this.sum += x;
        if (this.v.length > this.size) {
            let xold = this.v.shift();
            this.sum -= xold;
        }
    }

    get_average() {
        if (this.v.length < this.minsize) {
            return -1;
        }
        else {
            return this.sum / this.v.length;
        }
    }

    reset() {
        this.v = [];
        this.sum = 0;
    }
}

/**
 * @param {Array} array array 
 * @return {Object} It returns min, max and indeces of an array
 */
export function max_min(array) {
    if (array.length === 0) {
        return {};
    }
    let maxv = array[0];
    let minv = array[0];
    let maxi = 0;
    let mini = 0;
    for (let i = 1; i < array.length; i++) {
        if (array[i] > maxv) { maxv = array[i]; maxi = i; }
        if (array[i] < minv) { minv = array[i]; mini = i; }
    }
    return { maxi: maxi, maxv: maxv, mini: mini, minv: minv, dv: maxv - minv };
}

/**
 * It converts float to string
 * @param {number} x float
 * @param {number} d length
 * @return {string} It returns string representation of float but truncated to length of d digits 
 */
export function f2t(x, d) {
    if (typeof (d) === 'undefined') {
        d = 5;
    }
    let dd = 1.0 * Math.pow(10, d);
    return '' + Math.floor(x * dd) / dd;
}