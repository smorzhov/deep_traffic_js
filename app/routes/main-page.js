import Ember from 'ember';

export default Ember.Route.extend({
    monaco: Ember.inject.service(),
    /*model: function() {
      return this;
    },*/
    actions: {
        willTransition(transition) {
            let element = document.getElementById('container');
            let newCode = element.outerText;
            let enter = newCode.search("\n");
            newCode = newCode.substring(enter+1);
            enter = newCode.search("\n");
            newCode = newCode.substring(0, enter);
            this.get('monaco').setCode(newCode);
        }
  }
});
