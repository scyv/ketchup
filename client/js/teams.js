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
        return resolveTeamMembers(this.key);
    },
    runningPomodoro() {
        Session.get("reactiveTimer");
        const runningPomodoro = Pomodoros.findOne({end: null, owner: this._id});
        if (runningPomodoro) {
            return [{
                pomodoro: runningPomodoro,
                timeLeft: moment(0).add(runningPomodoro.targetLength, "minutes")
                - moment(new Date() - runningPomodoro.start),
                subscriptions: findSubscribers(this._id)
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
    },
    teamPomodoroCount() {
        return Pomodoros.find({owner: {$in: this.members}}).count();
    },
    teamPomodoroInterruptions() {
        return Pomodoros.find({owner: {$in: this.members}, interrupted: true}).count();
    }
});

Template.subscriptionList.helpers({
    subscriptions() {
        return findSubscribers(this.toString());
    }
});

Template.teams.events({
    "click .btn-edit-team"() {
        Session.set("selectedTeam", this._id);
        Router.go("team");
        return false;
    },
    "click .btn-create-team"() {
        const name = prompt("Name");
        if (name) {
            Meteor.call("createTeam", name);
        }
        return false;
    },
    "click .btn-join-team"() {
        const key = prompt("Key");
        if (key) {
            Meteor.call("joinTeam", key);
        }
        return false;
    },
    "click .btn-leave-team"() {
        if (confirm("Möchten Sie das Team " + this.name + " wirklich verlassen?")) {
            Meteor.call("leaveTeam", this.key);
        }
        return false;
    },
    "click .btn-subscribe"(evt, templ) {
        const owner = this.pomodoro.owner;
        const btn = $(".member-" + owner + " .btn-subscribe");
        const isActive = btn.hasClass("active");
        if (isActive) {
            Meteor.call("removeOutgoingSubscription", owner);
        } else {
            Meteor.call("createSubscription", owner);
        }
        return false;
    }
});

function findSubscribers(userId) {
    return Subscriptions.find({to: userId}).map((sub) => {
        return Meteor.users.findOne(sub.from).profile.name;
    });
}