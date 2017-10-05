import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base'

import './../views/main.html';

export let pomodoroHandle;
export let teamsHandle;
export let connectedUsersHandle;

Accounts.onResetPasswordLink((token) => {
    window.setTimeout(()=>{
        Router.go("resetPassword", {token});
    }, 500);
});

formattedTime = function (time) {
    if (!time) {
        return '-';
    }
    return moment.duration(time).humanize();
};

formattedDate = function (date) {
    if (!date) {
        return '-';
    }
    return moment(new Date(date)).format('DD.MM.YYYY, HH:mm') + ' Uhr';
};

UI.registerHelper('formattedTime', function (time) {
    return formattedTime(time);
});

UI.registerHelper('formattedDate', function (dateTime) {
    return formattedDate(dateTime);
});

Template.layout.events({
    'click .home'() {
        Router.go("/");
    },
    'click .btn-logout'() {
        Meteor.logout();
    },
    'click .btn-teams'() {
        Router.go("/teams");
    },
    'click .btn-pomodoro'() {
        Router.go("/");
    }
});

Meteor.startup(() => {
    moment.locale('de');

    Tracker.autorun(() => {
        pomodoroHandle = Meteor.subscribe("pomodoros");
        teamsHandle = Meteor.subscribe("teams");
        connectedUsersHandle = Meteor.subscribe("connectedUsers");
    });
});
