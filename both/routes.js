import { Meteor } from "meteor/meteor"

Router.configure({
    layoutTemplate: "layout"
});

Router.route("/", function () {
    if (Meteor.userId()) {
        this.render("pomodoro");
    } else {
        this.render("login");
    }
}, {name: "pomodoro"});

Router.route("/login", function () {
    this.render("login");
}, {name: "login"});

Router.route("/teams", function () {
    if (Meteor.userId()) {
        this.render("teams");
    } else {
        this.render("login");
    }
}, {name: "teams"});

Router.route("/resetPasswordMailSent", function () {
    this.render("resetPasswordMailSent")
}, {name: "resetPasswordMailSent"});

Router.route("/resetPassword/:token", function () {
    Session.set("password-reset-token", this.params.token);
    this.render("resetPassword")
}, {name: "resetPassword"});
