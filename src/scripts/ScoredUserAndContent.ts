/**
 * SCENARIO #1
 * [WITNESS]
 *
 * OBJECTIVES:
 */

import { assert } from 'console';
import fs from 'fs';
import { IContentVeracityDistribJSON, IFollowersDistribJSON, INatureDistribJSON } from '../helpers/interfaces/IEvaluation';
import { zipf } from '../helpers/utils/distributionLaw';
import getRandomSubarray, { contentReplicationDistributionByVeracity } from '../helpers/utils/tools';
import {
  APPROACH,
  MIN_Y_ADJUST, NB_ROUNDS, NUMBER_USERS, POSTS_PER_USER,
} from '../modules/Constant';
import { OSN } from '../modules/Osn';
import { Nature, User } from '../modules/User';
import ScoreBasedExpositionPolicy from '../policies/fetching-policies/ScoreBasedExpositionPolicy';
import DirectFiveStarScoringPolicy from '../policies/scoring-policies/DirectFiveStarScoringPolicy';

const jsonfile = require('jsonfile');

// Init Evaluation Results interfaces
const natureDistrib: INatureDistribJSON = { malicious: 0, average: 0, truthfull: 0 };
const followersDistrib : IFollowersDistribJSON = { nbFollowers: [] };
const contentVeracityDistrib : IContentVeracityDistribJSON = { malicious: [], average: [], truthfull: [] };

// Set timer
const start = new Date().getTime();

// CREATE OSN
const osn = new OSN();
osn.attach(new ScoreBasedExpositionPolicy());
osn.attach(new DirectFiveStarScoringPolicy());

// REGISTER N USERS in OSN
let i: number;

for (i = 0; i < NUMBER_USERS; i++) {
  const usr = new User();
  osn.addUser(usr);

  switch (usr.nature) {
    case Nature.MALICIOUS:
      natureDistrib.malicious++;
      break;
    case Nature.AVERAGE:
      natureDistrib.average++;
      break;
    case Nature.TRUTHFULL:
      natureDistrib.truthfull++;
      break;
    default:
      break;
  }
}
console.log('\x1b[32m%s\x1b[0m', `${osn.users.length} users registred`);

let rank = 0;
osn.users.forEach((user) => {
  // FOLLOW
  const nbFollowers = zipf(1 + rank / MIN_Y_ADJUST);
  rank++;

  followersDistrib.nbFollowers.push(nbFollowers);

  const followers = getRandomSubarray(osn.users, nbFollowers);
  followers.forEach((follower) => { osn.follow(follower, user); });

  // POST
  for (let index = 0; index < POSTS_PER_USER; index++) {
    const tmpContent = osn.post(user);

    switch (user.nature) {
      case Nature.MALICIOUS:
        contentVeracityDistrib.malicious.push(tmpContent.veracity);
        break;
      case Nature.AVERAGE:
        contentVeracityDistrib.average.push(tmpContent.veracity);
        break;
      case Nature.TRUTHFULL:
        contentVeracityDistrib.truthfull.push(tmpContent.veracity);
        break;
      default:
        break;
    }
  }
});

assert(osn.feed.length === NUMBER_USERS * POSTS_PER_USER);
assert(osn.users.length === NUMBER_USERS);

console.log('\x1b[32m%s\x1b[0m', 'Following list of all users completed');
console.log('\x1b[32m%s\x1b[0m', 'Content posting of all users completed');
console.log('\x1b[32m%s\x1b[0m', 'General feed built');

const initialContentRepDistrib = contentReplicationDistributionByVeracity(osn);

// FETCHS AND RETWEETS
for (let index = 0; index < NB_ROUNDS; index++) {
  console.log('\x1b[32m%s\x1b[0m', `Round ${index + 1} :`);
  osn.fetchAll();
  console.log('\x1b[32m%s\x1b[0m', 'All users updated their feed');
  osn.rateAll(APPROACH);
  console.log('\x1b[32m%s\x1b[0m', 'All users Rated content from their feed');
  osn.retweetAll();
  console.log('\x1b[32m%s\x1b[0m', 'All users Scrolled and retweeted');

  // Snapshot ?
}

const finalContentRepDistrib = contentReplicationDistributionByVeracity(osn);

// AVERAGE Rewteet feed veracity for each user

console.log('\x1b[32m%s\x1b[0m', 'Fetch & Retweet phase completed');
console.log('\x1b[34m%s\x1b[0m', `Simulation completed in ${Math.trunc((new Date().getTime() - start) / 1000)} seconds`);

// EXPORT RESULTS
fs.mkdir('results', () => {
  jsonfile.writeFile('results/Scored_UserNatureDistrib.json', natureDistrib, { spaces: 2, EOL: '\r\n' });
  console.log('\x1b[36m%s\x1b[0m', 'User Nature Distribution file written');

  jsonfile.writeFile('results/Scored_FollowersDistrib.json', followersDistrib, { spaces: 2, EOL: '\r\n' });
  console.log('\x1b[36m%s\x1b[0m', 'Followers Distribution file written');

  jsonfile.writeFile('results/Scored_ContentVeracityDistrib.json', contentVeracityDistrib, { spaces: 2, EOL: '\r\n' });
  console.log('\x1b[36m%s\x1b[0m', 'Content veracity Distribution file written');

  jsonfile.writeFile('results/Scored_InitialContentReplication.json', initialContentRepDistrib, { spaces: 2, EOL: '\r\n' });
  console.log('\x1b[36m%s\x1b[0m', 'Initial content replication file written');

  jsonfile.writeFile('results/Scored_FinalContentReplication.json', finalContentRepDistrib, { spaces: 2, EOL: '\r\n' });
  console.log('\x1b[36m%s\x1b[0m', 'Final content replication file written');
});
