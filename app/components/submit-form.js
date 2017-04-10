import Ember from 'ember';

export default Ember.Component.extend({
    userInputData: false,
    actions: {
        showForm() {
            this.set("userInputData", true);
        },
        submitData() {
            let userEmail = this.get('userEmail');
            let userNick = this.get('userNick');
            $.ajax({
                type: "POST",
                url: "http://deep-traffic-server.azurewebsites.net/api/users",
                data: { mph: 42, email: userEmail, user: userNick }
            });
            this.set("userInputData", false);
        },
        cancelSubmit() {
            this.set("userInputData", false);
        }
    }
});
