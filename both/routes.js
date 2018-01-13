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

Router.route("/team", function () {
    if (Meteor.userId()) {
        this.render("team");
    } else {
        this.render("login");
    }
}, {name: "team"});

Router.route("/settings", function () {
    if (Meteor.userId()) {
        this.render("settings");
    } else {
        this.render("login");
    }
}, {name: "settings"});

Router.route("/charts", function () {
    if (Meteor.userId()) {
        this.render("charts");
    } else {
        this.render("login");
    }
}, {name: "charts"});


Router.route("/resetPasswordMailSent", function () {
    this.render("resetPasswordMailSent")
}, {name: "resetPasswordMailSent"});

Router.route("/resetPassword/:token", function () {
    Session.set("password-reset-token", this.params.token);
    this.render("resetPassword")
}, {name: "resetPassword"});
