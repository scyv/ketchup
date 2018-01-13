import { Template } from "meteor/templating";
import { pomodoroHandle } from "./main";
import { NotificationCenter } from "./notificationCenter";
import { ProgressCircle} from "./progressCircle";

let progressIndicator = undefined;


Template.pomodoro.helpers({
    pomodoroLoading() {
        const ready = pomodoroHandle.ready();
        if (ready && progressIndicator) {
            progressIndicator.updateProgress(0, getFormattedTargetLength());
        }
        return !ready;
    },
    runningPomodoro() {
        Session.get("reactiveTimer");
        if (!progressIndicator  || !progressIndicator.isRendered()) {
            renderPomodoroPie();
        }

        const runningPomodoro = Pomodoros.findOne({end: null, owner: Meteor.userId()});
        if (runningPomodoro) {
            const now = new Date();
            const values = {
                pomodoro: runningPomodoro,
                timeRunning: now - runningPomodoro.start + 1000,
                timeLeft: moment(0).add(runningPomodoro.targetLength, "minutes") - moment(now - runningPomodoro.start)
            };
            const percent = parseInt(100 * ((now - runningPomodoro.start) / 1000) / (runningPomodoro.targetLength * 60));
            if (progressIndicator) {
                progressIndicator.updateProgress(percent, formattedPomodoroTime(values.timeLeft));
            }
            updateTitle(values);
            checkOvertime(values);
            return values;
        }
        return undefined;
    },
    pomodoroCountToday() {
        return Pomodoros.find({owner: Meteor.userId(), start: {$gte: moment().startOf("day").toDate()}}).count();
    },
    interruptionsToday() {
        return Pomodoros.find({
            owner: Meteor.userId(),
            start: {$gte: moment().startOf("day").toDate()},
            interrupted: true
        }).count();
    },
    pomodoroCount() {
        return Pomodoros.find({owner: Meteor.userId()}).count();
    },
    subscriptions() {
        return Subscriptions.find({to: Meteor.userId()});
    },
    from() {
        const user = Meteor.users.findOne(this.from);
        if (user) {
            return user.profile.name;
        }
        return this.from;
    },
    rowClass() {
        return Session.get("isWideScreen") && Teams.find().count() > 0 ? "col-xs-6 widescreen" : "col-xs-12";
    },
    wideScreen() {
        return Session.get("isWideScreen") && Teams.find().count() > 0;
    }
});

Template.pomodoro.events({
    "click .btn-start"() {
        Meteor.call("startPomodoro", ()=> {
            NotificationCenter.notifyStarted();
        });
    },
    "click .btn-interrupt"() {
        Meteor.call("stopPomodoro", "");
    },
    "click .btn-remove-subscription"() {
        Meteor.call("removeIncomingSubscription", this.from);
    }
});

Template.pomodoro.onRendered(()=> {
    renderPomodoroPie();
    const determineWideScreen = () => {
        Session.set("isWideScreen", window.innerWidth >= 700);
    };
    $(window).on('resize', _.debounce(determineWideScreen, 100));
    determineWideScreen();
});


function renderPomodoroPie() {
    const pomodoroPie = $(".pie")[0];
    if (pomodoroPie) {
        progressIndicator = new ProgressCircle(pomodoroPie);
        progressIndicator.create(pomodoroPie);
        if (Meteor.user() && Meteor.user().profile) {
            progressIndicator.updateProgress(0, getFormattedTargetLength());
        }
    }
}

function getFormattedTargetLength() {
    if (!Meteor.user()) {
        return 0;
    }
    return formattedPomodoroTime(Meteor.user().profile.settings.pomodoroLength * 60 * 1000);
}

function updateTitle(values) {
    if (values.timeLeft <= 0) {
        document.title = "Ketchup";
    } else {
        document.title = "Ketchup " + formattedPomodoroTime(values.timeLeft);
    }
}

function checkOvertime(values) {
    const runningPomodoro = values.pomodoro;
    if (values.timeRunning > runningPomodoro.targetLength * 60 * 1000) {
        Meteor.call("stopPomodoro", "", () => {
            NotificationCenter.notifyFinished(runningPomodoro);
            progressIndicator.finished();
        });
    }
}