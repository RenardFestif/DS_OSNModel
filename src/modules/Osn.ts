/* eslint-disable no-case-declarations */
import Gaussian from 'ts-gaussian';
import { Observer } from '../helpers/IObserver';
import { Subject } from '../helpers/ISubject';
import { assert, between, symeticNumber } from '../helpers/utils/tools';
import {
  AVERAGE_RETWEET_PER_USER_PER_UNIT_OF_TIME, CASE_SIGMA_RATING, DEFAULT_FAKE_RETWEET_TRESHOLD, FAKE_RETWEET_MULTIPLICATOR, NUMBER_USERS, OPTIMISTIC_SIGMA_RATING, TOP_CONNECTED_PERCENTAGE,
} from './Constant';
import Content from './Content';
import { Nature, User } from './User';

export enum State {
    FETCH,
    SCORE,
    IDDLE
}

// export enum Policy {
//   DEFAULT,
// }

export enum Approach{
  OPTIMISTIC,
  RANDOM,
  PESSIMISTIC,
}

interface Message{
  body: {
    arg0? : Object,
    arg1? : Object,
    arg2? : Object,
  },
}

export class OSN implements Subject {
    private _users: Array<User>;
    private _observers: Array<Observer>;
    private _feed: Array<Content>;
    private _maxContentReplication : number
    // private _policy: Policy;

    public message: Message;
    public state: State;

    constructor() {
      this._users = [];
      this._observers = [];
      this._feed = [];
      this._maxContentReplication = TOP_CONNECTED_PERCENTAGE;
      // this._policy = Policy.DEFAULT;

      this.message = this.resetMessage();
      this.state = State.IDDLE;
    }

    /** GETTERS */
    get users(): Array<User> { return this._users; }

    get observers(): Array<Observer> { return this._observers; }

    get feed(): Array<Content> { return this._feed; }

    get maxContentReplication(): number { return this._maxContentReplication; }

    // get policy(): Policy { return this._policy; }

    getUser(id: number): any { return this._users.find((user) => user.id === id); }

    /** SETTERS */
    // set policy(policy: Policy) { this._policy = policy; }
    set maxContentReplication(maxContentReplication: number) { this._maxContentReplication = maxContentReplication; }

    /** MODIFIERS */
    addUser(user: User): void {
      this.users.push(user);
    }

    addUsers(users: Array<User>): void {
      users.forEach((user) => this.users.push(user));
    }

    /** METHODS */

    scoreDiscretization(continuousScore: number): number {
      if (between(continuousScore, 0, 0.20)) {
        return 1;
      }
      if (between(continuousScore, 0.20, 0.40)) {
        return 2;
      }
      if (between(continuousScore, 0.40, 0.60)) {
        return 3;
      }
      if (between(continuousScore, 0.60, 0.80)) {
        return 4;
      }
      return 5;
    }

    getMaxContentRep():number {
      const ctReps : number[] = [];
      this.feed.forEach((content) => {
        ctReps.push(content.impact);
      });
      return Math.max(...ctReps);
    }

    getContentByID(id:number):Content|undefined {
      return this.feed.find((content) => content.id === id);
    }

    getContentReplicationScalable(content: Content, exitWaranty : number):number {
      return (content.impact + (exitWaranty / 10)) / this.maxContentReplication;
    }

    getContentReplicationAdjustedByScore(content : Content): number {
      return ((content.impact / this.maxContentReplication) + (content.score / 100)) / 2;
    }

    resetMessage():Message {
      return {
        body: {
          arg0: {},
          arg1: {},
          arg2: {},
        },
      };
    }

    checkUserRegistred(user:User): void {
      if (this.getUser(user.id) === undefined) {
        throw new Error('One of the specified user is not registered in the OSN');
      }
    }

    sortFeedByImpact():void {
      this.feed.sort((a, b) => a.impact - b.impact);
    }

    sortFeedByID():void {
      this.feed.sort((a, b) => a.id - b.id);
    }

    sortFeedByScoreThenContentReplication(): void {
      this.feed.sort((a, b) => a.score - b.score || a.impact - b.impact);
    }

    retweetAll(): void {
      this.users.forEach((user) => {
        // RETWEET OR NOT RETWEET
        if (Math.random() <= AVERAGE_RETWEET_PER_USER_PER_UNIT_OF_TIME) {
          let rt = false;
          let i = 0;
          // We determine a content to retweet based on the content replication and the veracity
          // Fact that On average fake news are 70% more likely to be retweeted
          while (!rt) {
            const offsetContent = user.publicFeed[i % user.publicFeed.length];
            const adjustedThreshold = DEFAULT_FAKE_RETWEET_TRESHOLD - ((((offsetContent.veracity / 100) * FAKE_RETWEET_MULTIPLICATOR) * DEFAULT_FAKE_RETWEET_TRESHOLD));
            if (Math.random() < adjustedThreshold) {
              rt = !rt;
              const oldContentRep = offsetContent.impact;
              this.retweet(user, offsetContent);
              const newContentRep = offsetContent.impact;
              assert(
                oldContentRep < newContentRep,
                'Bad Content replication evolution',
              );
              assert(
                offsetContent.id === user.publicFeed[i % user.publicFeed.length].id,
                'Different ids',
              );
              const verif = this.getContentByID(user.publicFeed[i % user.publicFeed.length].id);
              if (verif) {
                assert(
                  offsetContent.impact === user.publicFeed[i % user.publicFeed.length].impact
                    && offsetContent.impact === verif.impact,
                  'Different Content  Replication',
                );
              }
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

    rateAll(approach : Approach): void {
      let score: number;
      let mu: number;
      let distribution : Gaussian;
      let sample: number;
      let sigma : number;

      this.users.forEach((user) => {
        sigma = user.nature === Nature.AVERAGE ? 1 : CASE_SIGMA_RATING;
        user.publicFeed.forEach((content) => {
          // Based on the content veracity and the scorer Nature we determine a rating from 1 to 5
          const ctVeracity = content.veracity;
          const userProfile = user.nature;

          switch (userProfile) {
            // Malicious user has a tendency to rate better malicious content
            // Normal distribution centred around (1 - veracity / 100 )
            case Nature.MALICIOUS:
              /**
               * veracity -> !veracity (between 0 and 1)
               * (100 - Veracity)/100
              */
              mu = (100 - ctVeracity) / 100;
              break;

            case Nature.TRUTHFULL:
              // Oposite of Malicious profile
              mu = ctVeracity / 100;
              break;

            default:
              switch (approach) {
                case Approach.OPTIMISTIC:
                  sigma = OPTIMISTIC_SIGMA_RATING;
                  mu = ctVeracity / 100;
                  break;

                default:
                  throw new Error('Please provide a valid Approach');
              }
              break;
          }

          distribution = new Gaussian(mu, sigma ** 2);
          sample = distribution.ppf(Math.random());
          if (sample < 0 || sample > 1) {
            sample = symeticNumber(sample, mu) % 1;
          }

          // Set the score to a discret Value (1 to 5 star rating)
          score = this.scoreDiscretization(sample);

          this.rate(user, content, score);
        });
      });

      this.maxContentReplication = this.getMaxContentRep();
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

    rate(user: User, content: Content, score: number): void {
      this.message.body = { arg0: user, arg1: content, arg2: score };
      this.state = State.SCORE;
      this.notify();
      this.resetMessage();
    }

    follow(userSender: User, userReceiver: User): void | never {
      // check if both users are registred on the OSN
      if (this.getUser(userSender.id) && this.getUser(userReceiver.id)) {
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
