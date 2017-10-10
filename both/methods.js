import { Meteor } from "meteor/meteor";
import { Factory } from "./factory";
import { check } from "meteor/check";

Meteor.methods({
    "startPomodoro"() {
        if (this.userId) {
            const pomodoro = Factory.createPomodoro(this.userId);
            pomodoro.start = new Date();
            pomodoro.targetLength = Meteor.user().profile.settings.pomodoroLength;
            Pomodoros.insert(pomodoro);
        }
    },
    "stopPomodoro"(comment) {
        check(comment, String);
        const runningPomodoro = Pomodoros.findOne({owner: this.userId, end: undefined});
        if (runningPomodoro) {
            Pomodoros.update(runningPomodoro._id, {$set: {end: new Date(), comment: comment}});
        }
    },
    "createTeam"(name) {
        check(name, String);
        if (this.userId) {
            const team = Factory.createTeam(name, this.userId);
            Teams.insert(team);
        }
    },
    "updateTeam"(key, name) {
        check(key, String);
        check(name, String);
        const team = Teams.findOne({owner: this.userId, key: key});
        if (team) {
            Teams.update(team._id, {$set: {name: name}});
        }
    },
    "joinTeam"(key) {
        check(key, String);

        const team = Teams.findOne({key: key});
        if (team) {
            Teams.update(team._id, {$addToSet: {members: this.userId}});
        }
    },
    "leaveTeam"(key) {
        check(key, String);
        const team = Teams.findOne({key: key});
        if (team) {
            Teams.update(team._id, {$pullAll: {members: [this.userId]}});
        }
    },
    "saveSettings"(userName, email, pomodoroLength) {
        check(userName, String);
        check(email, String);
        check(pomodoroLength, Number);

        if (this.userId) {
            Meteor.users.update(this.userId, {
                $set: {
                    profile: {
                        name: userName,
                        settings: {
                            pomodoroLength: pomodoroLength
                        }
                    }
                }
            });
        }
    }
});