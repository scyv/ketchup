import { Template } from 'meteor/templating';
import { pomodoroHandle } from './main';

Template.pomodoro.helpers({
    pomodoroLoading() {
        return !pomodoroHandle.ready();
    },
    runningPomodoro() {
        const runningPomodoro = Pomodoros.findOne({end: null, owner: Meteor.userId()});
        if (runningPomodoro) {
            return {
                pomodoro: runningPomodoro,
                timeRunning: new Date() - runningPomodoro.start
            }
        }
        return undefined;
    },
    pomodoroCount() {
        return Pomodoros.find({owner: Meteor.userId()}).count();
    }
});

Template.pomodoro.events({
    'click .btn-start'() {
        Meteor.call("startPomodoro");
    },
    'click .btn-interrupt'() {
        Meteor.call("stopPomodoro", "");
    }
});