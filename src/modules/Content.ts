import Gaussian from 'ts-gaussian';
import { SIGMA_VERACITY } from './Constant';
import { Nature, User } from './User';

export default class Content {
    private _author: User;

    private _veracity: number;

    private _score: number;

    private _impact: number;

    constructor(author: User) {
      this._author = author;
      this._veracity = this.initVeracity();
      this._score = author.score;
      this._impact = author.followers.length === 0 ? 1 : author.followers.length;
    }

    //* * GETTERS */
    public get author() { return this._author; }
    public get veracity() { return this._veracity; }
    public get score() { return this._score; }
    public get impact() { return this._impact; }

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
}
