/**
 * SCENARIO #3
 * [Case Comparison Scored]
 *
 * OBJECTIVES:

 *
 * PROTOCOL:

 *
 * - Compare Content propagation
 */

import fs from 'fs';
import {
  IContentReplicationCaseJSON, IContentVeracityDistribJSON, IFollowersDistribJSON, INatureDistribJSON,
} from '../helpers/interfaces/IEvaluation';
import { zipf } from '../helpers/utils/distributionLaw';
import getRandomSubarray, {
  getcontentReplicationCase, assert,
} from '../helpers/utils/tools';
import {
  APPROACH,
  MIN_Y_ADJUST, NB_ROUNDS, NUMBER_USERS, POSTS_PER_USER, TOP_CONNECTED_PERCENTAGE,
} from '../modules/Constant';
import { OSN } from '../modules/Osn';
import { Nature, User } from '../modules/User';
import ScoreBasedExpositionPolicy from '../policies/fetching-policies/ScoreBasedExpositionPolicy';
import DirectFiveStarScoringPolicy from '../policies/scoring-policies/DirectFiveStarScoringPolicy';

const jsonfile = require('jsonfile');

// Init Evaluation Results interfaces
const topConnected: IContentReplicationCaseJSON[] = [];
const averageConnected: IContentReplicationCaseJSON[] = [];
const lessConnected: IContentReplicationCaseJSON[] = [];

// Set timer
const start = new Date().getTime(); let scenarios = 0;

for (let simul = 0; simul < 3; simul++) {
  for (let scenario = 0; scenario < 2; scenario++) {
    // RESET USER ID COUNT
    User.count = 0;
    // CREATE OSN
    const osn = new OSN();
    // ATTACH DEFAULT POLICY
    osn.attach(new ScoreBasedExpositionPolicy());
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

    let profileNature : Nature = Nature.AVERAGE;
    // SET RIGHT USER PROFILE [TRUTHFULL / MALICIOUS]
    switch (scenario) {
      case 0:
        profileNature = Nature.MALICIOUS;
        break;

      case 1:
        profileNature = Nature.TRUTHFULL;
        break;

      default:
        break;
    }

    assert(profileNature === Nature.MALICIOUS || profileNature === Nature.TRUTHFULL, `Error profileNature ${profileNature} is not set to the right nature [MALICIOUS = 0 / TRUTHFULL = 2 ] `);

    // SET RIGHT USER [HIGHLY / AVERAGE / POORLY RANKED] TO ANALYSE TO MALICIOUS
    switch (simul) {
      case 0:
        osn.getUser(1).nature = profileNature;
        if (scenario === 0) { topConnected.push(getcontentReplicationCase(osn.getUser(1))); }
        assert(osn.getUser(1).nature === profileNature && osn.getUser(1).followers.length >= ((NUMBER_USERS * TOP_CONNECTED_PERCENTAGE) / 100), 'Error Nature attribution or user ranking unexpected');
        break;

      case 1:
        osn.getUser(Math.ceil((NUMBER_USERS * 10) / 100)).nature = profileNature;
        if (scenario === 0) { averageConnected.push(getcontentReplicationCase(osn.getUser(Math.ceil((NUMBER_USERS * 10) / 100)))); }
        assert(osn.getUser(Math.ceil((NUMBER_USERS * 10) / 100)).nature === profileNature && osn.getUser(Math.ceil((NUMBER_USERS * 10) / 100)).followers.length <= ((NUMBER_USERS * TOP_CONNECTED_PERCENTAGE) / 100), `Error Nature attribution or user ranking unexpected\n User ${osn.getUser(Math.ceil((NUMBER_USERS * 10) / 100)).followers.id} Ranking ${osn.getUser(Math.ceil((NUMBER_USERS * 10) / 100)).followers.length} different from expected ${((NUMBER_USERS * TOP_CONNECTED_PERCENTAGE) / 100)}`);
        break;

      case 2:
        osn.getUser(NUMBER_USERS).nature = profileNature;
        if (scenario === 0) { lessConnected.push(getcontentReplicationCase(osn.getUser(NUMBER_USERS))); }
        assert(osn.getUser(NUMBER_USERS).nature === profileNature && osn.getUser(NUMBER_USERS).followers.length <= ((NUMBER_USERS * TOP_CONNECTED_PERCENTAGE) / 100), 'Error Nature attribution or user ranking unexpected');
        break;

      default:
        break;
    }

    assert(osn.feed.length === NUMBER_USERS * POSTS_PER_USER, 'Unexpected general feed length');
    assert(osn.users.length === NUMBER_USERS, 'Unexpected Number of user registred');

    console.log('\x1b[32m%s\x1b[0m', 'Following list of all users completed');
    console.log('\x1b[32m%s\x1b[0m', 'Content posting of all users completed');
    console.log('\x1b[32m%s\x1b[0m', 'General feed built');

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

    switch (simul) {
      case 0:
        topConnected.push(getcontentReplicationCase(osn.getUser(1)));
        break;
      case 1:
        averageConnected.push(getcontentReplicationCase(osn.getUser(Math.ceil((NUMBER_USERS * 10) / 100))));
        break;
      case 2:
        lessConnected.push(getcontentReplicationCase(osn.getUser(NUMBER_USERS)));
        break;

      default:
        break;
    }

    console.log('\x1b[32m%s\x1b[0m', 'Fetch & Retweet phase completed');
    console.log('\x1b[34m%s\x1b[0m', `Scenario ${simul}.${scenario} completed`);
    scenarios++;
  }
}

assert(scenarios === 6, `Expected 6 different simulation got ${scenarios}`);
console.log('\x1b[34m%s\x1b[0m', `Full cases scenario Simulation completed in ${Math.trunc((new Date().getTime() - start) / 1000)} seconds`);

// EXPORT RESULTS
fs.mkdir('results', () => {
  jsonfile.writeFile('results/Scored_CaseComparisonTopConnected.json', topConnected, { spaces: 2, EOL: '\r\n' });
  console.log('\x1b[36m%s\x1b[0m', 'Top Connected Case comparison file written');

  jsonfile.writeFile('results/Scored_CaseComparisonAverageConnected.json', averageConnected, { spaces: 2, EOL: '\r\n' });
  console.log('\x1b[36m%s\x1b[0m', 'Average Connected Case Comparison file written');

  jsonfile.writeFile('results/Scored_CaseComparisonLessConnected.json', lessConnected, { spaces: 2, EOL: '\r\n' });
  console.log('\x1b[36m%s\x1b[0m', 'Less Connected Case Comparison file written');
});
