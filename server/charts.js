import { Meteor } from 'meteor/meteor';

Meteor.publish("chartData", function () { //must be "function" as we use "this"
    const teams = Teams.find({members: {$in: [this.userId]}});
    let pomodoroOwners = [this.userId];
    teams.forEach(function (team) {
        pomodoroOwners = _.union(pomodoroOwners, team.members);
    });

    ReactiveAggregate(this, Pomodoros, [
        {
            $match: {
                owner: {$in: pomodoroOwners}
            }
        },
        {
            $group: {
                _id: {$dayOfWeek: "$start"},
                count: {$sum: 1},
                owners: {$push: "$owner"}
            }
        }
    ], {
        clientCollection: "chartData"
    });
});