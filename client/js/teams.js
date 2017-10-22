import { Template } from "meteor/templating";
import { teamsHandle } from "./main";
import { connectedUsersHandle } from "./main";
import { pomodoroHandle } from "./main";

Template.teams.helpers({
    teamsLoading() {
        return !teamsHandle.ready();
    },
    teams() {
        return Teams.find();
    },
    membersLoading() {
        return !connectedUsersHandle.ready()
            || !pomodoroHandle.ready();
    },
    members() {
        const memberIds = Teams.findOne({key: this.key}).members;
        return memberIds.map(id =>Meteor.users.findOne(id));
    },
    runningPomodoro() {
        Session.get("reactiveTimer");
        const runningPomodoro = Pomodoros.findOne({end: null, owner: this._id});
        if (runningPomodoro) {
            return [{
                pomodoro: runningPomodoro,
                timeLeft: moment(0).add(runningPomodoro.targetLength, "minutes") - moment(new Date() - runningPomodoro.start)
            }];
        }
        return [];
    },
    isFocused() {
        return Pomodoros
    },
    isTeamOwner() {
        return this.owner === Meteor.userId();
    }
});

Template.teams.events({
    "click .btn-edit-team"() {
        Session.set("selectedTeam", this._id);
        Router.go("team");
    },
    "click .btn-create-team"() {
        const name = prompt("Name");
        if (name) {
            Meteor.call("createTeam", name);
        }
    },
    "click .btn-join-team"() {
        const key = prompt("Key");
        if (key) {
            Meteor.call("joinTeam", key);
        }
    },
    "click .btn-leave-team"() {
        if (confirm("Möchten Sie das Team " + this.name + " wirklich verlassen?")){
            Meteor.call("leaveTeam", this.key);
        }
    }
});