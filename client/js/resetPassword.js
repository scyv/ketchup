Template.resetPassword.events({
    'click #btnResetPassword': () => {
        const newPassword = $("#passwordInput").val();
        const token = Session.get("password-reset-token");
        Accounts.resetPassword(token, newPassword, (err)=>{
            if (err) {
                alert(err);
            } else {
                Router.go("/");
            }
        });
    }
});