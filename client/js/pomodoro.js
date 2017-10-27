import { Template } from "meteor/templating";
import { pomodoroHandle } from "./main";
import { NotificationCenter } from "./notificationCenter";
import { ProgressCircle} from "./progressCircle";

let progressIndicator = undefined;


Template.pomodoro.helpers({
    pomodoroLoading() {
        const ready = pomodoroHandle.ready();
        if (ready) {
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
            progressIndicator.updateProgress(percent, formattedPomodoroTime(values.timeLeft));
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
});


function renderPomodoroPie() {
    const pomodoroPie = $(".pie")[0];
    if (pomodoroPie) {
        progressIndicator = new ProgressCircle(pomodoroPie);
        progressIndicator.create(pomodoroPie);
        if (Meteor.user().profile) {
            progressIndicator.updateProgress(0, getFormattedTargetLength());
        }
    }
}

function getFormattedTargetLength() {
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
            progressIndicator.finish();
        });
    }
}