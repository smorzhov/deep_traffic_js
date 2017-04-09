import Ember from 'ember';
import { readFileSync } from './../utils/io'; 

export default Ember.Service.extend({

    init() {
        if (!this.get('codeCached')) {
            this.set('codeCached', Ember.Object.create());
        }
    },

    getCode() {
        let code = this.get(`codeCached.${"code"}`);
        if (!code) {
            code = readFileSync(`./app/resources/files/codeSample`, 'utf8');
            this.set(`codeCached.${"code"}`, code);
        }
        return code;
    },

    setCode(newCode) {
        this.set(`codeCached.${"code"}`, newCode);
    }
});
