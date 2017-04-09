import Ember from 'ember';

export default Ember.Route.extend({
    monaco: Ember.inject.service(),
    actions: {
        willTransition() {
            let newCode = monaco.editor.getModels()[0].getValue();
            this.get('monaco').setCode(newCode);
        }
    }
});
