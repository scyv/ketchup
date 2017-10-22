import { Template } from "meteor/templating";

Template.team.helpers({
    selectedTeam() {
        return Teams.findOne(Session.get("selectedTeam"));
    },
    saveSuccess() {
        return Session.get("settingsSaved");
    }
});

Template.team.events({
    "click .btn-save"(evt) {
        const team = Teams.findOne(Session.get("selectedTeam"));
        const buttonElement = evt.currentTarget;
        buttonElement.disabled = true;
        const teamName = $("#inputTeamName").val();
        Meteor.call("updateTeam", team.key, teamName, (err)=> {
            buttonElement.disabled = false;
            if (err) {
                alert(err);
            } else {
                Session.set("settingsSaved", true);
                Meteor.setTimeout(()=> {
                    Session.set("settingsSaved", false);
                    Router.go("teams");
                }, 3000);
            }
        });
        return false;
    },
    "click .btn-cancel"() {
        Router.go("teams");
        return false;
    }
});