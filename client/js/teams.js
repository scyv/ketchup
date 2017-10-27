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
        return memberIds.map(id =>Meteor.users.findOne(id)).sort((a, b)=> {
            const aName = a.profile.name.toLowerCase();
            const bName = b.profile.name.toLowerCase();
            return aName < bName ? -1 : aName === bName ? 0 : 1;
        });
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
    isTeamOwner() {
        return this.owner === Meteor.userId();
    },
    isActive() {
        return Subscriptions.findOne({from: Meteor.userId(), to: this.pomodoro.owner}) ? "active" : "";
    },
    notSelf() {
        return this.pomodoro.owner !== Meteor.userId();
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
        if (confirm("Möchten Sie das Team " + this.name + " wirklich verlassen?")) {
            Meteor.call("leaveTeam", this.key);
        }
    },
    "click .btn-subscribe"(evt, templ) {
        const btn = $(templ.find(".btn-subscribe"));
        const isActive = btn.hasClass("active");
        if (isActive) {
            Meteor.call("removeOutgoingSubscription", this.pomodoro.owner);
        } else {
            Meteor.call("createSubscription", this.pomodoro.owner);
        }
    }
});