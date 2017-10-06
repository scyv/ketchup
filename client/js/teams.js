import { Template } from 'meteor/templating';
import { teamsHandle } from './main';

Template.teams.helpers({
    teamsLoading() {
        return !teamsHandle.ready();
    },
    teams() {
        return Teams.find();
    }
});

Template.teams.events({
    'click .btn-edit-team'() {
    },
    'click .btn-create-team'() {
        const name = prompt("Name");
        if (name) {
            Meteor.call("createTeam", name);
        }
    },
    'click .btn-join-team'() {
        const key = prompt("Key");
        if (key) {
            Meteor.call("joinTeam", key);
        }
    },
    'click .btn-leave-team'() {
        Meteor.call("leaveTeam", this.key);
    },
    'click .team'() {
        Router.go("team", {key: this.key});
    }
});