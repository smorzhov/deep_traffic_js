import Ember from 'ember';

export default Ember.Component.extend({
    monaco: Ember.inject.service(),

    didInsertElement() {
        const _loader = require('monaco-loader');
        let code = this.get('monaco').getCode();
        let editor;
        _loader().then(monaco => {
            editor = monaco.editor.create(document.getElementById('container'), {
                language: 'javascript',
                theme: 'vs',
                automaticLayout: true,
                formatOnPaste: true,
                value: code
            });
        });
    }
});
