import { Template } from "meteor/templating";

Template.settings.helpers({
    currentUser() {
        return Meteor.user();
    },
    email() {
        return Meteor.user().emails[0].address;
    },
    saveSuccess() {
        return Session.get("settingsSaved");
    }
});

Template.settings.events({
    "click .btn-save"(evt) {
        const buttonElement = evt.currentTarget;
        buttonElement.disabled = true;
        const userName = $("#inputUserName").val();
        const email = $("#inputEmail").val();
        const pomodoroLength = parseInt($("#inputPomodoroLength").val(), 10);
        const refreshInterval = parseInt($("#inputRefreshInterval").val(), 10);
        Meteor.call("saveSettings", userName, email, pomodoroLength, refreshInterval, (err)=> {
            buttonElement.disabled = false;
            if (err) {
                alert(err);
            } else {
                Session.set("settingsSaved", true);
                Meteor.setTimeout(()=>{
                    Session.set("settingsSaved", false);
                }, 3000);
            }
        });
        return false;
    }
});