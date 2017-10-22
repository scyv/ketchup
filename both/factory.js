import { Random } from "meteor/random"

export class Factory {

    static createPomodoro (ownerId) {
        return {
            start: undefined,
            end: undefined,
            targetLength: undefined,
            interrupted: false,
            comment: "",
            owner: ownerId
        }
    }
    static createTeam (name, ownerId) {
        return {
            name: name,
            key: Random.id(32),
            owner: ownerId,
            members: [ownerId]
        };
    }
}