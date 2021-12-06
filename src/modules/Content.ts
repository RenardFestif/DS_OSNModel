import Gaussian from 'ts-gaussian';
import { SIGMA_VERACITY } from './Constant';
import { Nature, User } from './User';

interface Estimation{
  userId: number,
  estimation : number
}

export default class Content {
    static count = 0;

    private _id: number;
    private _author: User;
    private _veracity: number;
    private _score: number;
    private _impact: number;
    private _estimations: Estimation[]

    constructor(author: User) {
      this._id = Content.count;
      this._author = author;
      this._veracity = this.initVeracity();
      this._score = author.score;
      this._impact = author.followers.length === 0 ? 1 : author.followers.length;
      this._estimations = [];
      Content.count += 1;
    }

    //* * GETTERS */
    public get author() { return this._author; }
    public get veracity() { return this._veracity; }
    public get score() { return this._score; }
    public get impact() { return this._impact; }
    public get id() { return this._id; }
    public get estimations() { return this._estimations; }

    //* * SETTERS */
    public set veracity(veracity : number) { this._veracity = veracity; }
    public set score(score : number) { this._score = score; }
    public set impact(impact : number) { this._impact = impact; }

    //* * INIT */
    public initVeracity():number {
      let muVeracity : number = 0;
      switch (this.author.nature) {
        case Nature.MALICIOUS:
          muVeracity = 0;
          break;

        case Nature.AVERAGE:
          muVeracity = 0.5;
          break;

        case Nature.TRUTHFULL:
          muVeracity = 1;
          break;

        default:
          break;
      }
      const distribution = new Gaussian(muVeracity, SIGMA_VERACITY);
      const sample = distribution.ppf(Math.random());

      // We need an integer as veracity score
      let veracity = Math.trunc(sample * 100);

      // Veracity score between 0 and 100
      if (veracity > 100) {
        veracity = 100;
      } else if (veracity < 0) {
        veracity = 0;
      }

      return veracity;
    }

    //* * METHODS */
    public convertToScalable(scalable: number):void {
      this.impact = scalable;
    }

    public copyContent(): Content {
      const content = new Content(this.author);
      content._id = this._id;
      content.impact = this.impact;
      return content;
    }

    public retweet(boostImpact: number) {
      this.impact += boostImpact;
    }
}
