#!/usr/bin/env ts-node

import { Content } from "./Content";
import { DEFAULT_SCORE, MU_NATURE, NATURE_MALICIOUS_THRESHOLD, NATURE_TRUTHFULL_THRESHOLD, SIGMA_NATURE } from "./Constant";
import Gaussian from 'ts-gaussian';

export enum Nature {
    MALICIOUS,
    AVERAGE,
    TRUTHFULL
}

export class User {
    static count = 0;
    private _id: number;
    private _feed: Array<Content>;
    private _follows: Array<User>;
    private _followers: Array<User>;
    private _score: number;
    private _nature: Nature;

    constructor() {
        User.count++;
        this._id = User.count;
        this._feed = [];
        this._follows = [];
        this._followers = [];
        this._score = DEFAULT_SCORE;
        this._nature = this.initNature();

        

    }


    /** GETTERS */
    public get id():number {return this._id;}

    public get nature(): Nature { return this._nature; }

    public get feed(): Array<Content> { return this._feed }

    public get follows(): Array<User> { return this._follows }

    public get followers(): Array<User> { return this._followers }

    public get score(): number { return this._score }


    /** MODIFYERS */

    public initNature(): Nature {

        const distribution = new Gaussian(MU_NATURE, SIGMA_NATURE);
        let sample = distribution.ppf(Math.random())
        if (sample > NATURE_TRUTHFULL_THRESHOLD) {
            return Nature.TRUTHFULL;
        } else if (sample < NATURE_MALICIOUS_THRESHOLD) {
            return Nature.MALICIOUS
        }
        else {
            return Nature.AVERAGE;
        }

    }

    public addFollower(user: User): void {
        this._followers.push(user);
    }


    /** USER ACTION FUNCTIONS */

    public post(content: Content): void {

    }

    public rate(content: Content): void {

    }

    public follow(user: User): void {
        this._follows.push(user);

    }
}


