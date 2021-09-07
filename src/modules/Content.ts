#!/usr/bin/env ts-node

import { User } from "./User";

export class Content {

    private author: User;
    private veracity: number;
    private score: number;
    private impact: number;

    constructor(author: User) {
        this.author = author;
        this.veracity = 0;
        this.score = author.getScore();
        this.impact = 0;
    }

}
