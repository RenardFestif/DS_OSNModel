import Gaussian from 'ts-gaussian';
import Flatted from 'flatted';
import Content from './Content';
import {
  DEFAULT_SCORE, MU_NATURE, NATURE_MALICIOUS_THRESHOLD, NATURE_TRUTHFULL_THRESHOLD, SIGMA_NATURE,
} from './Constant';
import { OSN } from './Osn';

export enum Nature {
    MALICIOUS,
    AVERAGE,
    TRUTHFULL
}

export class User {
    static count = 0;

    private _id: number;
    private _publicFeed: Array<Content>;
    private _privateFeed: Array<Content>;
    private _retweets : Array<Content>;
    private _follows: Array<User>;
    private _followers: Array<User>;
    private _score: number;
    private _nature: Nature;
    private _osns: Array<OSN>;

    constructor() {
      User.count += 1;

      this._id = User.count;
      this._publicFeed = [];
      this._privateFeed = [];
      this._follows = [];
      this._followers = [];
      this._retweets = [];
      this._score = DEFAULT_SCORE;
      this._nature = this.initNature();
      this._osns = [];
    }

    /** GETTERS */
    public get id():number { return this._id; }

    public get nature(): Nature { return this._nature; }

    public get publicFeed(): Array<Content> { return this._publicFeed; }

    public get privateFeed(): Array<Content> { return this._privateFeed; }

    public get retweets(): Array<Content> { return this._retweets; }

    public get follows(): Array<User> { return this._follows; }

    public get followers(): Array<User> { return this._followers; }

    public get score(): number { return this._score; }

    public get osns(): Array<OSN> { return this._osns; }

    //* * SETTERS */

    public set publicFeed(publicFeed:Array<Content>) { this.publicFeed = publicFeed; }
    public set privateFeed(privateFeed:Array<Content>) { this.privateFeed = privateFeed; }
    public set retweets(retweets: Array<Content>) { this.retweets = retweets; }
    public set nature(nature: Nature) { this._nature = nature; }
    public set score(score: number) { this._score = score; }

    /** MODIFIERS */

    public resetPublicFeed() {
      this._publicFeed = [];
    }

    public initNature(): Nature {
      const distribution = new Gaussian(MU_NATURE, SIGMA_NATURE);
      const sample = distribution.ppf(Math.random());
      if (sample > NATURE_TRUTHFULL_THRESHOLD) {
        return Nature.TRUTHFULL;
      } if (sample < NATURE_MALICIOUS_THRESHOLD) {
        return Nature.MALICIOUS;
      }

      return Nature.AVERAGE;
    }

    public addFollower(user: User): void {
      this._followers.push(user);
    }

    public retweet(content:Content): void {
      this.retweets.push(content);
    }

    /** METHODS */
    sortedRetweetable(): Array<Content> {
      return this.publicFeed.filter((content) => (!this.retweets.includes(content))).sort((a, b) => a.impact - b.impact);
    }

    /** USER ACTION FUNCTIONS */

    public writeContent(): Content {
      const content = new Content(this);
      this.privateFeed.push(content);
      return content;
    }

    public rate(): void {

    }

    public follow(user: User): void {
      this._follows.push(user);
    }
}
