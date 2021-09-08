#!/usr/bin/env ts-node

import { ContentObserver } from "../helpers/impl/observers/ContentObserver";
import { Content } from "../modules/Content";
import { OSN } from "../modules/Osn";
import { User } from "../modules/User";

let osn = new OSN();
let usr1 = new User();
let usr2 = new User();
let usrs = [usr1, usr2];

osn.addUsers(usrs);


console.log(osn.users);
console.log(osn.getUser(1))

