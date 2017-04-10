import Ember from 'ember';

export default Ember.Component.extend({
    userInputData: false,
    emailIsInvalide: false,
    nickIsInvalide: false,
    validateInputData() {
        let regExpForEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let userEmail = this.get('userEmail');
        let userNick = this.get('userNick');
        if (userNick === undefined || userNick.trim() === "") {
            this.set("nickIsInvalide", true);
        } else {
            this.set("nickIsInvalide", false);
        }
        if (userEmail === undefined || userEmail.trim() === "" || !regExpForEmail.test(userEmail)) {
            this.set("emailIsInvalide", true);
        } else {
            this.set("emailIsInvalide", false);
        }
    },
    actions: {
        showForm() {
            this.set("nickIsInvalide", false);
            this.set("emailIsInvalide", false);
            this.set("userInputData", true);
            this.set('userEmail', "");
            this.set('userNick', "");
        },
        submitData() {
            this.validateInputData();
            if (this.get("emailIsInvalide") || this.get("nickIsInvalide")) {
                return;
            }
            let userEmail = this.get('userEmail');
            let userNick = this.get('userNick');
            $.ajax({
                type: "POST",
                url: "http://deep-traffic-server.azurewebsites.net/api/users",
                data: { mph: 44, email: userEmail, user: userNick }
            });
            this.set("userInputData", false);
        },
        cancelSubmit() {
            this.set("userInputData", false);
        }
    }
});
