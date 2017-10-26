import { Notifications } from "./notifications";

export class NotificationCenter {

    static notifyFinished(pomo) {

        let title = "Pomodoro beendet.";
        const subscriptionCursor = Subscriptions.find({to: pomo.owner});
        const subscriptionCount = subscriptionCursor.count();
        let message = "";
        if (subscriptionCount > 0) {
            if (subscriptionCount === 1) {
                message += "\nOffene Anfrage von ";
            } else {
                message += "\nOffene Anfragen von ";
            }
            const userList = subscriptionCursor.fetch().map((sub) =>{
                return Meteor.users.findOne(sub.from).profile.name;
            });
            message += "\n" + userList.join(", ");
        }
        Notifications.notify(title, message);

    }

    static notifyStarted() {
        Notifications.notify("Pomodoro gestartet.");
    }

}