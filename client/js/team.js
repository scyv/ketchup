import { Template } from "meteor/templating";

resolveTeamMembers = (key) => {
    console.log("resolve team", key);
    const team = Teams.findOne({key: key});
    if (!team) {
        return [];
    }
    const memberIds = team.members;
    console.log(memberIds);
    return memberIds.map(id => Meteor.users.findOne(id)).sort((a, b)=> {
        const aName = a.profile.name.toLowerCase();
        const bName = b.profile.name.toLowerCase();
        return aName < bName ? -1 : aName === bName ? 0 : 1;
    });
};

Template.team.helpers({
    selectedTeam() {
        return Teams.findOne(Session.get("selectedTeam"));
    },
    saveSuccess() {
        return Session.get("settingsSaved");
    },
    members() {
        return resolveTeamMembers(this.key).filter((member)=> {
            return member._id !== Meteor.userId();
        });
    }
});

Template.team.events({
    "click .btn-remove-teammember"() {
        if (confirm("Möchten Sie " + this.profile.name + " aus dem Team entfernen?")) {
            const team = Teams.findOne(Session.get("selectedTeam"));
            Meteor.call("removeTeamMember", this._id, team.key);
        }
    },
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