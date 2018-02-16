import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
    // code to run on server at startup
    Accounts.emailTemplates.siteName = "Ketchup";
    Accounts.emailTemplates.from = "Ketchup <ketchup@mailgun.scytec.de>";

    // Run timer to stop overtimed pomodoros
    Meteor.setInterval(function () {
        const now = new Date();
        Pomodoros.find({end: null}).forEach((po) => {
            if (now - po.start > po.targetLength * 60 * 1000) {
                Pomodoros.update(po._id, {$set: {end: new Date(), comment: ""}});
            }
        })
    }, 1000 * 60);
});

Meteor.publish("pomodoros", function () {
    if (this.userId) {
        this.autorun(()=> {
            // find all pomodoros of all members of my teams (because i want to see them in the teams view)
            const teams = Teams.find({members: {$in: [this.userId]}});
            let pomodoroOwners = [this.userId];
            teams.forEach(function (team) {
                pomodoroOwners = _.union(pomodoroOwners, team.members);
            });

            return Pomodoros.find({owner: {$in: pomodoroOwners}, start: {$gte: moment().subtract(7, "day").toDate()}}); //, {fields: {secretInfo: 0}});
        });
    } else {
        return [];
    }
});


Meteor.publish("teams", function () {
    if (this.userId) {
        return Teams.find({members: {$in: [this.userId]}}); //, {fields: {secretInfo: 0}});
    } else {
        return [];
    }
});

Meteor.publish("connectedUsers", function () {
    if (this.userId) {
        this.autorun(()=> {
            let users = [];
            const handle = Teams.find({members: {$in: [this.userId]}});
            handle.forEach((team)=> {
                users = _.union(users, team.members);
            });
            return Meteor.users.find({_id: {$in: users}}, {fields: {'profile': 1}});
        });
    } else {
        return [];
    }
});

Meteor.publish("subscriptions", function () {
    if (this.userId) {
        this.autorun(()=> {
            let users = [];
            const handle = Teams.find({members: {$in: [this.userId]}});
            handle.forEach((team)=> {
                users = _.union(users, team.members);
            });

            return Subscriptions.find({$or: [{to: {$in: users}}, {from: {$in: users}}]});
        });
    } else {
        return [];
    }
});


