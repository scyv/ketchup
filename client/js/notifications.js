export class Notifications {

    static _checkNotificationsAvailable() {
        return ("Notification" in window);
    }

    static _checkNotificationsAllowed() {
        return Notification.permission === "granted";
    }

    static _requestPermissionAndNotify(callback) {
        if (Notification.permission !== 'denied') {
            Notification.requestPermission((permission) => {
                if (permission === "granted") {
                    callback();
                }
            });
        }
    }

    static notify(text) {
        const openNotification = () => {
            new Notification(text);
        };
        if (!Notifications._checkNotificationsAvailable()) {
            return;
        }
        if (Notifications._checkNotificationsAllowed()) {
            openNotification();
        } else {
            Notifications._requestPermissionAndNotify(openNotification);
        }

    }
}
