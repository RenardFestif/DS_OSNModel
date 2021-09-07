#!/usr/bin/env ts-node

import { Observer } from "../helpers/IObserver";
import { Subject } from "../helpers/ISubject";
import { Content } from "./Content";
import { User } from "./User";

export enum State {
    IDDLE,
    POST,
    FOLLOW,
    RATE
}


export class OSN implements Subject {

    private users: Array<User>;
    private observers: Array<Observer>;
    public state: State;


    constructor() {
        this.users = [];
        this.observers = [];
        this.state = State.IDDLE;
    }


    /** GETTERS */
    getUsers(): Array<User> { return this.users }
    getObservers(): Array<Observer> { return this.observers }


    /** SETTERS */
    addUser(user: User): void {
        this.users.push(user);
    }
    addUsers(users: Array<User>): void {
        users.forEach(user => this.users.push(user))
    }

    /** ACTIONS */
    post(user: User, content: Content): void {

        this.state = State.POST;
        this.notify();
    }

    rate(user: User, content: Content): void {
        this.notify();
    }

    follow(userSender: User, userReceiver: User): void {
        this.notify();
    }

    /** INTERFACE IMPLEMENTATION */

    attach(observer: Observer): void {
        const isExist = this.observers.includes(observer);
        if (isExist) {
            return console.log('Subject: Observer has been attached already.');
        }

        console.log('Subject: Attached an observer.');
        this.observers.push(observer);
    }
    detach(observer: Observer): void {
        const observerIndex = this.observers.indexOf(observer);
        if (observerIndex === -1) {
            return console.log('Subject: Nonexistent observer.');
        }

        this.observers.splice(observerIndex, 1);
        console.log('Subject: Detached an observer.');
    }
    notify(): void {
        console.log('Subject: Notifying observers...');
        for (const observer of this.observers) {
            observer.update(this);
        }
    }

}