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
    }
});

Template.teamMonitor.helpers({
    teamsLoading() {
        if (!teamsHandle.ready()) {
            // hack for safari
            Session.get("reactiveTimer");
        }
        return !teamsHandle.ready();
    },
    teams() {
        return Teams.find();
    }
});

Template.teamActivity.helpers({
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
    }
});

Template.subscriptionList.helpers({
    subscriptions() {
        return findSubscribers(this.toString());
    }
});

Template.subscription.helpers({
    isActive() {
        const owner = this.pomodoro ? this.pomodoro.owner : this._id;
        return Subscriptions.findOne({from: Meteor.userId(), to: owner}) ? "active" : "";
    },
    notSelf() {
        const owner = this.pomodoro ? this.pomodoro.owner : this._id;
        return owner !== Meteor.userId();
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
    }
});

Template.teams.events({
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
    "click .btn-subscribe"() {
        const owner = this.pomodoro ? this.pomodoro.owner : this._id;
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
        const from = Meteor.users.findOne(sub.from);
        if (!from) {
            return "";
        }
        return from.profile.name;
    });
}