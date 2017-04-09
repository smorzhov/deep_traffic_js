/* jshint node: true */
'use strict';

const fs = require('fs');

/**
 * It reads the file asynchronously
 * @param {string} fileName file name
 * @param {string} encoding file encoding
 * @return {Promise} Promise object
 */
 export function readFileAsync(fileName, encoding) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, encoding, (error, content) => {
            if (error) {
                return reject(error);
            }
            resolve(content);
        });
    });
};

/**
 * It reads the file synchronously.
 * @throws It throws error if the file is not found or cannot be opened
 * @param {string} fileName file name
 * @param {string} encoding file encoding
 * @return {string} file content
 */
export  function readFileSync(fileName, encoding) {
    return fs.readFileSync(fileName, encoding);
};
