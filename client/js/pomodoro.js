import { Template } from "meteor/templating";
import { pomodoroHandle } from "./main";
import { Notifications } from "./notifications";
import { NotificationCenter } from "./notificationCenter";

function renderPomodoroPie() {
    const pomodoroPie = $(".pie")[0];
    if (pomodoroPie) {
        var NS = "http://www.w3.org/2000/svg";
        var svg = document.createElementNS(NS, "svg");
        var circle = document.createElementNS(NS, "circle");
        var title = document.createElementNS(NS, "title");

        circle.setAttribute("r", 16);
        circle.setAttribute("cx", 16);
        circle.setAttribute("cy", 16);
        circle.setAttribute("stroke-dasharray", "0 100");
        circle.setAttribute("class", "progress");
        svg.setAttribute("viewBox", "0 0 32 32");
        svg.setAttribute("shape-rendering", "geometricPrecision");
        title.textContent = "";

        var innerCircle = document.createElementNS(NS, "circle");
        innerCircle.setAttribute("r", 7);
        innerCircle.setAttribute("cx", 16);
        innerCircle.setAttribute("cy", 16);
        innerCircle.setAttribute("fill", "#FFFFFF");

        var outerCircle = document.createElementNS(NS, "circle");
        outerCircle.setAttribute("r", 20);
        outerCircle.setAttribute("cx", 16);
        outerCircle.setAttribute("cy", 16);
        outerCircle.setAttribute("fill", "none");
        outerCircle.setAttribute("stroke", "#FFFFFF");
        outerCircle.setAttribute("stroke-width", "9px");

        svg.appendChild(title);
        svg.appendChild(circle);
        svg.appendChild(innerCircle);
        svg.appendChild(outerCircle);

        pomodoroPie.innerHTML = "";
        pomodoroPie.appendChild(svg);
    }
}

function pieIsRendered() {
    return $(".pie circle").size() > 0;
}

function updatePomodoroPie(percent, title) {
    const circleElem = $(".pie circle.progress");
    const titleElem = $(".pie title");
    circleElem.attr("stroke-dasharray", parseInt(percent, 10) + " 100");
    titleElem.text(title);
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
            const circleElem = $(".pie circle.progress");
            circleElem.attr("class", "progress finished");
            circleElem.attr("stroke-dasharray", "0 100");
        });
    }
}

Template.pomodoro.helpers({
    pomodoroLoading() {
        const ready = pomodoroHandle.ready();
        return !ready;
    },
    runningPomodoro() {
        Session.get("reactiveTimer");
        if (!pieIsRendered()) {
            renderPomodoroPie();
        }

        const runningPomodoro = Pomodoros.findOne({end: null, owner: Meteor.userId()});
        if (runningPomodoro) {
            const now = new Date();
            const values = {
                pomodoro: runningPomodoro,
                timeRunning: now - runningPomodoro.start,
                timeLeft: moment(0).add(runningPomodoro.targetLength, "minutes") - moment(now - runningPomodoro.start)
            };
            const percent = parseInt(100 * ((now - runningPomodoro.start) / 1000) / (runningPomodoro.targetLength * 60));
            updatePomodoroPie(percent, formattedPomodoroTime(values.timeRunning));
            updateTitle(values);
            checkOvertime(values);
            return values;
        }
        return undefined;
    },
    targetLength() {
        return Meteor.user().profile.settings.pomodoroLength * 60 * 1000;
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
            $(".pie circle.progress").attr("class", "progress running");
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
