#!/usr/bin/env ts-node

import { Content } from "./Content";
import { DEFAULT_SCORE, MU_NATURE, NATURE_MALICIOUS_THRESHOLD, NATURE_TRUTHFULL_THRESHOLD, SIGMA_NATURE } from "./Constant";
import Gaussian from 'ts-gaussian';

enum Nature {
    MALICIOUS,
    AVERAGE,
    TRUTHFULL
}

export class User {
    private feed: Array<Content>;
    private follows: Array<User>;
    private followers: Array<User>;
    private score: number;
    private nature: Nature;

    constructor() {
        this.feed = [];
        this.follows = [];
        this.followers = [];
        this.score = DEFAULT_SCORE;
        this.nature = this.setNature();

    }


    /** GETTERS */
    public getNature(): Nature { return this.nature; }

    public getFeed(): Array<Content> { return this.feed }

    public getFollows(): Array<User> { return this.follows }

    public getFollowers(): Array<User> { return this.followers }

    public getScore(): number { return this.score }


    /** SETTERS */

    public setNature(): Nature {

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


    /** USER ACTION FUNCTIONS */

    public post(content: Content): void {

    }

    public rate(content: Content): void {

    }

    public follow(user: User): void {

    }
}


