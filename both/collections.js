import { Mongo } from 'meteor/mongo';

/*
 {
   "_id" : "TS6hN2bqvCETbtmuF",
   "start" : ISODate("2018-01-13T22:47:10.341Z"),
   "end" : ISODate("2018-02-16T20:35:27.875Z"),
   "targetLength" : 25,
   "interrupted" : false,
   "comment" : "",
   "owner" : "HB    hCPNxFWwtxXfSCN"
 }
 */
Pomodoros = new Mongo.Collection("pomodoros");

/*
 {
   "_id" : "gt7RmWr5hkbQiS78q",
   "name" : "myTeam",
   "key" : "QE4ZB8zkv7fLokmBwn6jsv5zanoAZsc2",
   "owner" : "KTFTP5FjfsuTAJZRb",
   "members" : [B5KwExCwkvagoaQ2b, kvagoaQ2bB5KwExCw]
 }
 */
Teams = new Mongo.Collection("teams");

/*
 {
   "_id" : "ousjdg6yExgukhfcK",
   "from" : "9Bq6YkjCH2QuXDJmB",
   "to" : "KTFTP5FjfsuTAJZRb"
 }
 */
Subscriptions = new Mongo.Collection("subscriptions");