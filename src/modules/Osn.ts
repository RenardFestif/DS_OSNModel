import { Observer } from '../helpers/IObserver';
import { Subject } from '../helpers/ISubject';
import {
  AVERAGE_RETWEET_PER_USER_PER_UNIT_OF_TIME, DEFAULT_FAKE_RETWEET_TRESHOLD, FAKE_RETWEET_MULTIPLICATOR, NUMBER_USERS,
} from './Constant';
import Content from './Content';
import { User } from './User';

export enum State {
    POST,
    IDDLE,
    FETCH
}

export enum Policy {
  DEFAULT,
}

interface Message{
  body: {arg0 : Object},
}

export class OSN implements Subject {
    private _users: Array<User>;
    private _observers: Array<Observer>;
    private _feed: Array<Content>;
    private _policy: Policy;

    public message: Message;
    public state: State;

    constructor() {
      this._users = [];
      this._observers = [];
      this._feed = [];
      this._policy = Policy.DEFAULT;

      this.message = this.resetMessage();
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

    /** METHODS */

    getContentReplicationScalable(content: Content):number {
      return content.impact / NUMBER_USERS;
    }

    resetMessage():Message {
      return { body: { arg0: {} } };
    }

    checkUserRegistred(user:User): void {
      if (this.getUser(user.id) === undefined) {
        throw new Error('One of the specified user is not registered in the OSN');
      }
    }

    sortFeedByImpact():void {
      this.feed.sort((a, b) => a.impact - b.impact);
    }

    // getScalableContentReplication():Content[] {
    //   this.sortFeedByImpact();
    //   const sortedFeed: Content[] = [];
    //   const minImpact = this.feed[0].impact;
    //   const maxImpact = this.feed[this.feed.length - 1].impact;

    //   this.feed.forEach((content) => {
    //     const { id } = content;
    //     const ct = content.copyContent();

    //     ct.convertToScalable(((content.impact - minImpact)) / maxImpact);
    //     sortedFeed.push(ct);
    //   });
    //   return sortedFeed;
    // }

    retweetAll(): void {
      this.users.forEach((user) => {
        // RETWEET OR NOT RETWEET
        if (Math.random() <= AVERAGE_RETWEET_PER_USER_PER_UNIT_OF_TIME) {
          // const retweetableContentSortedByImpact = user.sortedRetweetable();
          let rt: Content | undefined;
          let i = 0;
          // console.log(retweetableContentSortedByImpact.length);
          while (rt === undefined) {
            const offsetContent = user.publicFeed[i % user.publicFeed.length];
            const adjustedThreshold = DEFAULT_FAKE_RETWEET_TRESHOLD - ((((offsetContent.veracity * FAKE_RETWEET_MULTIPLICATOR) / 100) * DEFAULT_FAKE_RETWEET_TRESHOLD));
            // console.log(adjustedThreshold, offsetContent.veracity, offsetContent.id);
            if (Math.random() <= adjustedThreshold) {
              rt = offsetContent;
              // console.log(rt.id);
              this.retweet(user, rt);
            }
            i++;
          }
        }
      });
    }

    fetchAll(): void {
      this.users.forEach((user) => {
        this.fetchContent(user);
      });
    }

    /** ACTIONS */
    post(user: User): Content {
      // checks if the user is registred on the OSN
      this.checkUserRegistred(user);
      // User write Content and sends it to the OSN
      const content = user.writeContent();

      // pushes the newly generated post in the osn general feed
      this.feed.push(content);
      return content;
    }

    private retweet(user:User, content:Content): void {
      user.retweet(content);
      content.retweet(user.followers.length);
    }

    private fetchContent(user:User): void {
      // checks if the user is registred on the OSN
      this.checkUserRegistred(user);

      this.message.body = { arg0: user };
      this.state = State.FETCH;
      this.notify();
      this.resetMessage();
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
      // console.log('Subject: Notifying observers...');
      this.observers.forEach((observer) => observer.update(this));
    }
}
