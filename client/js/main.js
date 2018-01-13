import { Template } from "meteor/templating";
import { Accounts } from "meteor/accounts-base"

export let pomodoroHandle;
export let teamsHandle;
export let connectedUsersHandle;
export let subscriptionsHandle;

Accounts.onResetPasswordLink((token) => {
    window.setTimeout(()=> {
        Router.go("resetPassword", {token});
    }, 500);
});

formattedTime = function (time) {
    if (!time) {
        return "-";
    }
    const duration = moment.duration(time);
    const hours = duration.hours();
    const minutes = duration.minutes() + 1;
    let formattedTimes = "";
    if (hours > 0) {
        formattedTimes += hours + " Stunde";
        if (hours > 1) {
            formattedTimes += "n";
        }
        formattedTimes += ", ";
    }
    formattedTimes += minutes + " Minute";
    if (minutes > 1) {
        formattedTimes += "n";
    }
    return formattedTimes;
};

formattedPomodoroTime = function (time) {
    if (!time) {
        return "";
    }
    return moment(time).format("mm:ss");
};

formattedDate = function (date) {
    if (!date) {
        return "-";
    }
    return moment(new Date(date)).format("DD.MM.YYYY, HH:mm") + " Uhr";
};

UI.registerHelper("formattedTime", function (time) {
    return formattedTime(time);
});

UI.registerHelper("formattedDate", function (dateTime) {
    return formattedDate(dateTime);
});

UI.registerHelper("formattedPomodoroTime", function (time) {
    return formattedPomodoroTime(time);
});

Template.layout.helpers({
    pomodoroSelected() {
        return Router.current().route.getName() === "pomodoro" ? "selected" : "";
    },
    teamsSelected() {
        return Router.current().route.getName().startsWith("team") ? "selected" : "";
    },
    settingsSelected() {
        return Router.current().route.getName() === "settings" ? "selected" : "";
    }
});

Template.layout.events({
    "click .home"() {
        Router.go("/");
    },
    "click .btn-logout"() {
        Meteor.logout();
    },
    "click .btn-teams"() {
        Router.go("/teams");
    },
    "click .btn-pomodoro"() {
        Router.go("/");
    },
    "click .btn-settings"() {
        Router.go("settings");
    }
});

ConnectedUsers = new Mongo.Collection("connectedUsers");

function updateReactiveTimer() {
    Session.set("reactiveTimer", Session.get("reactiveTimer") + 1);
    let refreshInterval = 1000;
    if (Meteor.user()) {
        refreshInterval = Meteor.user().profile.settings.refreshInterval || refreshInterval;
    }
    Meteor.setTimeout(updateReactiveTimer, refreshInterval);
}


Meteor.startup(() => {
    moment.locale("de");

    Tracker.autorun(() => {
        pomodoroHandle = Meteor.subscribe("pomodoros");
        teamsHandle = Meteor.subscribe("teams");
        subscriptionsHandle = Meteor.subscribe(("subscriptions"));
    });
    connectedUsersHandle = Meteor.subscribe("connectedUsers");

    Session.set("reactiveTimer", 0);
    updateReactiveTimer();
});
