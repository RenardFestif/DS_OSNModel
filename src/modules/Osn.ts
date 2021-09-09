import { Observer } from '../helpers/IObserver';
import { Subject } from '../helpers/ISubject';
import Content from './Content';
import { User } from './User';

export enum State {
    POST,
    IDDLE
}

export enum Policy {
  DEFAULT,
}

export class OSN implements Subject {
    private _users: Array<User>;
    private _observers: Array<Observer>;
    private _feed: Array<Content>;
    private _policy: Policy;

    public message: JSON;
    public state: State;

    constructor() {
      this._users = [];
      this._observers = [];
      this._feed = [];
      this._policy = Policy.DEFAULT;

      this.message = <JSON> <unknown> null;
      this.state = State.IDDLE;
    }

    /** GETTERS */
    get users(): Array<User> { return this._users; }

    get observers(): Array<Observer> { return this._observers; }

    get feed(): Array<Content> { return this._feed; }

    get policy(): Policy { return this._policy; }

    getUser(id: number): any { return this._users.find((user) => user.id === id); }

    /** SETTERS */
    set policy(policy: Policy) { this._policy = policy; }

    /** MODIFIERS */
    addUser(user: User): void {
      this.users.push(user);
    }

    addUsers(users: Array<User>): void {
      users.forEach((user) => this.users.push(user));
    }

    /** TOOLS */
    resetMessage():void {
      this.message = <JSON> <unknown> null;
    }

    /** ACTIONS */
    post(user: User): void {
      // checks if the user is registred on the OSN
      if (this.getUser(user.id) === undefined) {
        throw new Error('One of the specified user is not registered in the OSN');
      }

      // User write Content and sends it to the OSN
      const post = user.writeContent();

      // pushes the newly generated post in the osn general feed
      this.feed.push(post);

      // const message = {
      //   data: post,
      // };

      // this.message = <JSON> <unknown> message;
      // this.state = State.POST;
      // this.notify();
    }

    retweet(user:User, content:Content): void {

    }

    fetchContent(user:User): void {
    }

    rate(user: User, content: Content): void {
      this.notify();
    }

    follow(userSender: User, userReceiver: User): void | never {
      // check if both users are registred on the OSN
      if (this.getUser(userSender.id) !== undefined && this.getUser(userReceiver.id) !== undefined) {
        userSender.follow(userReceiver);
        userReceiver.addFollower(userSender);
      } else {
        throw new Error('One of the specified user is not registered in the OSN');
      }
    }

    /** INTERFACE IMPLEMENTATION */

    attach(observer: Observer): void {
      const isExist = this.observers.includes(observer);
      if (isExist) {
        return console.log('Subject: Observer has been attached already.');
      }

      this.observers.push(observer);
      return console.log('Subject: Attached an observer.');
    }

    detach(observer: Observer): void {
      const observerIndex = this.observers.indexOf(observer);
      if (observerIndex === -1) {
        return console.log('Subject: Nonexistent observer.');
      }

      this.observers.splice(observerIndex, 1);
      return console.log('Subject: Detached an observer.');
    }

    notify(): void {
      console.log('Subject: Notifying observers...');
      this.observers.forEach((observer) => observer.update(this));
    }
}
