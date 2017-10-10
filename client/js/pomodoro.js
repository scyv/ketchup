import { Template } from "meteor/templating";
import { pomodoroHandle } from "./main";

Template.pomodoro.helpers({
    pomodoroLoading() {
        return !pomodoroHandle.ready();
    },
    runningPomodoro() {
        const runningPomodoro = Pomodoros.findOne({end: null, owner: Meteor.userId()});
        if (runningPomodoro) {
            const now = new Date();
            return {
                pomodoro: runningPomodoro,
                timeRunning: now - runningPomodoro.start,
                timeLeft: moment(0).add(runningPomodoro.targetLength, "minutes") - moment(now - runningPomodoro.start)
            }
        }
        return undefined;
    },
    pomodoroCount() {
        return Pomodoros.find({owner: Meteor.userId()}).count();
    }
});

Template.pomodoro.events({
    "click .btn-start"() {
        Meteor.call("startPomodoro");
    },
    "click .btn-interrupt"() {
        Meteor.call("stopPomodoro", "");
    }
});