import { Template } from "meteor/templating";
import { pomodoroHandle } from "./main";
import { NotificationCenter } from "./notificationCenter";
import { ProgressCircle} from "./progressCircle";

let progressIndicator = undefined;

function calcNextQuarter(quarter) {
    return moment().startOf('hour').add((Math.floor((moment().minute() + 3) / 15) + quarter) * 15, 'minute');
}

function calcNextQuarterMinutes(quarter) {
    return calcNextQuarter(quarter).diff(new Date(), 'minutes');
}

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
        if (!progressIndicator || !progressIndicator.isRendered()) {
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
    },
    nextQuarter() {
        Session.get("reactiveTimer");
        return calcNextQuarter(1).format("LT");
    },
    afterNextQuarter() {
        Session.get("reactiveTimer");
        return calcNextQuarter(2).format("LT");
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
    },
    "click .btn-next-quarter"() {
        Meteor.call("startPomodoro", calcNextQuarterMinutes(1), ()=> {
            NotificationCenter.notifyStarted();
        });
    },
    "click .btn-after-next-quarter"() {
        Meteor.call("startPomodoro", calcNextQuarterMinutes(2), ()=> {
            NotificationCenter.notifyStarted();
        });
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