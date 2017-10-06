import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
    // code to run on server at startup
    Accounts.emailTemplates.siteName = "Ketchup";
    Accounts.emailTemplates.from = "Ketchup <ketchup@mailgun.scytec.de>";
});

Meteor.publish("pomodoros", function () {
    if (this.userId) {

        // find all pomodoros of all members of my teams (because i want to see them in the teams view)
        const teams = Teams.find({members: {$in: [this.userId]}});
        let pomodoroOwners = [this.userId];
        teams.forEach(function (team) {
            pomodoroOwners = _.union(pomodoroOwners, team.members);
        });

        return Pomodoros.find({owner: {$in: pomodoroOwners}}); //, {fields: {secretInfo: 0}});
    } else {
        this.ready();
    }
});


Meteor.publish("teams", function () {
    if (this.userId) {
        return Teams.find({members: {$in: [this.userId]}}); //, {fields: {secretInfo: 0}});
    } else {
        this.ready();
    }
});

Meteor.publish("connectedUsers", function () {
    if (this.userId) {
        let users = [];
        Teams.find({members: {$in: [this.userId]}}).forEach((team)=> {
            users = _.union(users, team.members);
        });
        return Meteor.users.find({_id: {$in: users}}, {fields: {'profile': 1}});
    } else {
        this.ready();
    }
});


