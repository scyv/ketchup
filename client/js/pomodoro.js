import { Template } from "meteor/templating";
import { pomodoroHandle } from "./main";
import { Notifications } from "./notifications";

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

        svg.setAttribute("viewBox", "0 0 32 32");
        title.textContent = "";
        svg.appendChild(title);
        svg.appendChild(circle);

        pomodoroPie.innerHTML = "";
        pomodoroPie.appendChild(svg);
    }
}

function pieIsRendered() {
    return $(".pie circle").size() > 0;
}

function updatePomodoroPie(percent, title) {
    const circleElem = $(".pie circle");
    const titleElem = $(".pie title");
    circleElem.attr("stroke-dasharray", parseInt(percent, 10) + " 100");
    titleElem.text(title);
}

function updateTitle(values) {
    document.title = "Ketchup " + formattedPomodoroTime(values.timeLeft);
}

function checkOvertime(values) {
    const runningPomodoro = values.pomodoro;
    if (values.timeRunning > runningPomodoro.targetLength * 60 * 1000) {
        Meteor.call("stopPomodoro", "", () => {
            Notifications.notify("Pomodoro gestoppt!");
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
            updatePomodoroPie(percent, values.timeRunning);
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
        return Pomodoros.find({owner: Meteor.userId(), interrupted: true}).count();
    },
    pomodoroCount() {
        return Pomodoros.find({owner: Meteor.userId()}).count();
    }
});

Template.pomodoro.events({
    "click .btn-start"() {
        Meteor.call("startPomodoro", ()=> {
            Notifications.notify("Pomodoro gestartet!");
        });
    },
    "click .btn-interrupt"() {
        Meteor.call("stopPomodoro", "", () => {
            Notifications.notify("Pomodoro angehalten!");
        });
    }
});

Template.pomodoro.onRendered(()=> {
    renderPomodoroPie();
});
