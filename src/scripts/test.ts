import { zipf } from '../helpers/utils/distributionLaw';
import getRandomSubarray from '../helpers/utils/tools';
import {
  MIN_Y_ADJUST, NB_ROUNDS_ANALYSIS, NUMBER_USERS, POSTS_PER_USER,
} from '../modules/Constant';
import Content from '../modules/Content';
import { OSN } from '../modules/Osn';
import { User } from '../modules/User';
import DefaultPolicy from '../policies/fetching-policies/DefaultPolicy';
import DirectFiveStarScoringPolicy from '../policies/scoring-policies/DirectFiveStarScoringPolicy';

// CREATE OSN
const osn = new OSN();
osn.attach(new DefaultPolicy());
osn.attach(new DirectFiveStarScoringPolicy());

// REGISTER N USERS in OSN
for (let i = 0; i < NUMBER_USERS; i++) {
  const usr = new User();
  osn.addUser(usr);
}

console.log('\x1b[32m%s\x1b[0m', `${osn.users.length} users registred`);

let rank = 0;
osn.users.forEach((user) => {
  // FOLLOW
  const nbFollowers = zipf(1 + rank / MIN_Y_ADJUST);
  rank++;

  const followers = getRandomSubarray(osn.users, nbFollowers);
  followers.forEach((follower) => { osn.follow(follower, user); });

  // POST
  for (let index = 0; index < POSTS_PER_USER; index++) {
    osn.post(user);
  }
});

const u1 : User = osn.getUser(1);
const u2 : User = osn.getUser(2);

const ctn = u2.privateFeed[0];

console.log(u2.score, ctn.score);
osn.rate(u1, ctn, 5);
console.log(u2.score, ctn.score);
