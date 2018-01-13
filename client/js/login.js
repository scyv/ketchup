function login() {
    var email = $('#emailInput').val();
    var password = $('#passwordInput').val();

    Meteor.loginWithPassword(email, password,  (err) => {
        if (err) {
            alert("Fehler: " + err, "ERROR");
        } else {
            Router.go('/');
            Tracker.flush();
        }
    });
}

Template.login.events({
    'keydown #passwordInput': (evt) => {
      if (evt.keyCode === 13) {
          login();
      }
    },
    'click #btnLogin': () => {
        login();
    },
    'click #btnRegister': () => {
        var email = $('#regEmailInput').val();
        var password = $('#regPasswordInput').val();
        var name = $('#regNameInput').val();

        var user = {
            email: email,
            password: password,
            profile: {
                name: name,
                settings: {
                    pomodoroLength: 25,
                    refreshInterval: 1000
                }
            }
        };

        Accounts.createUser(user, (err)  => {
            if (err) {
                alert("Fehler: " + err, "ERROR");
            } else {
                Router.go('/');
            }
        });
    },
    'click #btnResetPassword': () => {
        var email = $('#emailInput').val();
        if (!email || email.trim() === "") {
            alert("Bitte geben Sie Ihre Email Adresse an");
            return;
        }
        Accounts.forgotPassword({
            email
        }, (err) => {
            if (err) {
                alert("Fehler: " + err, "ERROR");
            } else {
                Router.go("resetPasswordMailSent");
            }
        });
    }
});