import Ember from 'ember';

export default Ember.Controller.extend({
    init() {
        this._super(...arguments);
    },
    actions: {
        saveCode() {
            const { dialog } = require('electron').remote;
            const fs = require('fs');
            dialog.showSaveDialog({
                filters: [{ name: 'JavaScript file', extensions: ['js'] }]
            }, fileName => {
                if (fileName === undefined) {
                    return;
                }
                fs.writeFile(fileName, monaco.editor.getModels()[0].getValue(), error => {
                    console.log(error);
                });
            });
        },
        loadCode() {
            const { dialog } = require('electron').remote;
            const fs = require('fs');
            dialog.showOpenDialog({
                filters: [{ name: 'JavaScript file', extensions: ['js'] }],
                openFile: true,
                multiSelections: false
            }, fileName => {
                if (fileName === undefined) {
                    return;
                }
                fs.readFile(fileName[0], 'utf8', (error, code) => {
                    if (error) {
                        return console.log(error);
                    }
                    monaco.editor.getModels()[0].setValue(code);
                });
            });
        }
    }
});
