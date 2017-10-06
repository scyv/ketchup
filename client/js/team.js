import { Template } from 'meteor/templating';
import { connectedUsersHandle } from './main';
import { teamsHandle } from './main';
import { pomodoroHandle } from './main';

Template.team.helpers({
    membersLoading() {
        return !connectedUsersHandle.ready()
            || !teamsHandle.ready()
            || !pomodoroHandle.ready();
    },
    members() {
        const selectedTeam = Session.get("selectedTeam");
        const memberIds = Teams.findOne({key: selectedTeam}).members;
        return memberIds.map(id =>Meteor.users.findOne(id));
    },
    runningPomodoro() {
        const runningPomodoro = Pomodoros.findOne({end: null, owner: this._id});
        if (runningPomodoro) {
            return {
                pomodoro: runningPomodoro,
                timeRunning: new Date() - runningPomodoro.start
            }
        }
        return undefined;
    }

});

Template.team.events({
    'click .btn-edit-team'() {
    },
    'click .btn-create-team'() {
    },
    'click .btn-join-team'() {
    }
});