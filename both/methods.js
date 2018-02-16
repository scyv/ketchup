import { Meteor } from "meteor/meteor";
import { Factory } from "./factory";
import { check } from "meteor/check";

function checkUserLoggedIn(ctx) {
    if (!ctx.userId) {
        throw Meteor.error("Unauthorized", 403);
    }
}

Meteor.methods({
    "startPomodoro"() {
        checkUserLoggedIn(this);
        const pomodoro = Factory.createPomodoro(this.userId);
        pomodoro.start = new Date();
        pomodoro.targetLength = Meteor.user().profile.settings.pomodoroLength;
        Pomodoros.insert(pomodoro);
    },
    "stopPomodoro"(comment) {
        checkUserLoggedIn(this);
        check(comment, String);
        const runningPomodoro = Pomodoros.findOne({owner: this.userId, end: null});

        // stopping within this duration before end of a pomodoro it not considered as interruption
        const interruptionTolerance = 2000;

        if (runningPomodoro) {
            const now = new Date();
            const interrupted = (now - runningPomodoro.start) + interruptionTolerance
                < (runningPomodoro.targetLength * 60 * 1000);
            Pomodoros.update(runningPomodoro._id, {$set: {end: now, interrupted: interrupted, comment: comment}});
        }
    },
    "createTeam"(name) {
        checkUserLoggedIn(this);
        check(name, String);
        const team = Factory.createTeam(name, this.userId);
        Teams.insert(team);
    },
    "updateTeam"(key, name) {
        checkUserLoggedIn(this);
        check(key, String);
        check(name, String);
        const team = Teams.findOne({owner: this.userId, key: key});
        if (team) {
            Teams.update(team._id, {$set: {name: name}});
        }
    },
    "joinTeam"(key) {
        checkUserLoggedIn(this);
        check(key, String);

        const team = Teams.findOne({key: key});
        if (team) {
            Teams.update(team._id, {$addToSet: {members: this.userId}});
        }
    },
    "leaveTeam"(key) {
        checkUserLoggedIn(this);
        check(key, String);
        const team = Teams.findOne({key: key});
        if (team) {
            Teams.update(team._id, {$pullAll: {members: [this.userId]}});
        }
    },
    "saveSettings"(userName, email, pomodoroLength, refreshInterval) {
        checkUserLoggedIn(this);
        check(userName, String);
        check(email, String);
        check(pomodoroLength, Number);
        check(refreshInterval, Number);

        Meteor.users.update(this.userId, {
            $set: {
                profile: {
                    name: userName,
                    settings: {
                        pomodoroLength: pomodoroLength,
                        refreshInterval: refreshInterval
                    }
                }
            }
        });
    },
    "createSubscription"(toUserId) {
        checkUserLoggedIn(this);
        check(toUserId, String);
        if (!Subscriptions.findOne({from: this.userId, to: toUserId})) {
            Subscriptions.insert({from: this.userId, to: toUserId});
        }
    },
    "removeOutgoingSubscription"(toUserId) {
        checkUserLoggedIn(this);
        check(toUserId, String);
        Subscriptions.remove({from: this.userId, to: toUserId});
    },
    "removeIncomingSubscription"(fromUserId) {
        checkUserLoggedIn(this);
        check(fromUserId, String);
        Subscriptions.remove({from: fromUserId, to: this.userId});
    },
    "removeTeamMember"(memberId, teamKey) {
        checkUserLoggedIn(this);
        check(memberId, String);
        check(teamKey, String);
        const team = Teams.findOne({key: teamKey});
        if (team && team.owner === this.userId) {
            Teams.update(team._id, {$pullAll: {members: [memberId]}});
        }


    }
});