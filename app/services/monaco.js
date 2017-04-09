import Ember from 'ember';
import { readFileSync } from './../utils/io'; 

export default Ember.Service.extend({
    init() {
        this._super(...arguments);
        if (!this.get('codeCached')) {
            this.set('codeCached', '');
        }
    },

    getCode() {
        let code = this.get(`codeCached`);
        if (!code) {
            code = readFileSync(`./app/resources/files/codeSample`, 'utf8');
            this.set(`codeCached`, code);
        }
        return code;
    },

    setCode(newCode) {
        this.set(`codeCached`, newCode);
    }
});
