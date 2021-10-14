/**
 * SCENARIO #1
 * [WITNESS]
 *
 * OBJECTIVES:
 * Simulate the default behaviour of a twitter like social plateform upon some basic user action
 * (Register / Follow / Post / Fetch / Retweet)
 *
 * PROTOCOL:
 * - Register N user
 * - Following according to the pareto distribution
 * - Post X content for each user
 * - I * ( Fetch & retweet )
 *
 * - Mesure Content replication of a new post
 */

import { assert } from 'console';
import fs from 'fs';
import {
  IContentReplicationDistribJSON,
} from '../helpers/interfaces/IEvaluation';
import { zipf } from '../helpers/utils/distributionLaw';
import getRandomSubarray, { averageArray, contentReplicationDistributionByVeracity } from '../helpers/utils/tools';
import {
  MIN_Y_ADJUST, NB_ROUNDS, NB_ROUNDS_ANALYSIS, NUMBER_USERS, POSTS_PER_USER,
} from '../modules/Constant';
import { OSN } from '../modules/Osn';
import { Nature, User } from '../modules/User';
import DefaultPolicy from '../policies/DefaultPolicy';

const jsonfile = require('jsonfile');

// Init Evaluation Results interfaces

const initialContentRepDistribs : IContentReplicationDistribJSON[] = [];
const finalContentRepDistribs : IContentReplicationDistribJSON[] = [];

// Set timer
const start = new Date().getTime();

for (let set = 0; set < NB_ROUNDS_ANALYSIS; set++) {
  console.log('\x1b[32m%s\x1b[0m', `Set ${set + 1} :`);
  // CREATE OSN
  const osn = new OSN();
  osn.attach(new DefaultPolicy());

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

  assert(osn.feed.length === NUMBER_USERS * POSTS_PER_USER);
  assert(osn.users.length === NUMBER_USERS);

  console.log('\x1b[32m%s\x1b[0m', 'Following list of all users completed');
  console.log('\x1b[32m%s\x1b[0m', 'Content posting of all users completed');
  console.log('\x1b[32m%s\x1b[0m', 'General feed built');

  initialContentRepDistribs.push(contentReplicationDistributionByVeracity(osn));

  // FETCHS AND RETWEETS
  for (let index = 0; index < NB_ROUNDS; index++) {
    console.log('\x1b[32m%s\x1b[0m', `Round ${index + 1} :`);
    osn.fetchAll();
    console.log('\x1b[32m%s\x1b[0m', 'All users updated their feed');
    osn.retweetAll();
    console.log('\x1b[32m%s\x1b[0m', 'All users Scrolled and retweeted');

  // Snapshot ?
  }

  finalContentRepDistribs.push(contentReplicationDistributionByVeracity(osn));

  // AVERAGE Rewteet feed veracity for each user

  console.log('\x1b[32m%s\x1b[0m', 'Fetch & Retweet phase completed');
  console.log('\x1b[34m%s\x1b[0m', `Simulation ${set} completed in ${Math.trunc((new Date().getTime() - start) / 1000)} seconds`);

  // EXPORT RESULTS
  //   fs.mkdir('results', () => {
  //     jsonfile.writeFile('results/Witness_UserNatureDistrib.json', natureDistrib, { spaces: 2, EOL: '\r\n' });
  //     console.log('\x1b[36m%s\x1b[0m', 'User Nature Distribution file written');

  //     jsonfile.writeFile('results/Witness_FollowersDistrib.json', followersDistrib, { spaces: 2, EOL: '\r\n' });
  //     console.log('\x1b[36m%s\x1b[0m', 'Followers Distribution file written');

  //     jsonfile.writeFile('results/Witness_ContentVeracityDistrib.json', contentVeracityDistrib, { spaces: 2, EOL: '\r\n' });
  //     console.log('\x1b[36m%s\x1b[0m', 'Content veracity Distribution file written');

  //     jsonfile.writeFile('results/Witness_InitialContentReplication.json', initialContentRepDistrib, { spaces: 2, EOL: '\r\n' });
  //     console.log('\x1b[36m%s\x1b[0m', 'Initial content replication file written');

  //     jsonfile.writeFile('results/Witness_FinalContentReplication.json', finalContentRepDistrib, { spaces: 2, EOL: '\r\n' });
  //     console.log('\x1b[36m%s\x1b[0m', 'Final content replication file written');
//   });
}

// AVERAGE RESULTS

const dataInit : [{veracity: number, contentReplication:number}] = [] as unknown as [{veracity: number, contentReplication:number}];
const dataFinal : [{veracity: number, contentReplication:number}] = [] as unknown as [{veracity: number, contentReplication:number}];

const initialCtRepDistribAvg : IContentReplicationDistribJSON = { data: dataInit, totalUsers: NUMBER_USERS, nbSimul: NB_ROUNDS_ANALYSIS };
const finalCtRepDistribAvg : IContentReplicationDistribJSON = { data: dataFinal, totalUsers: NUMBER_USERS, nbSimul: NB_ROUNDS_ANALYSIS };

let tmp : {[veracity: number] : number[]} = {};
const veracities : number[] = [];
initialContentRepDistribs.forEach((ctRD) => {
  ctRD.data.forEach((entity) => {
    if (tmp[entity.veracity]) {
      tmp[entity.veracity].push(entity.contentReplication);
    } else {
      tmp[entity.veracity] = [entity.contentReplication];
      veracities.push(entity.veracity);
    }
  });
});

veracities.forEach((veracity) => {
  dataInit.push({ veracity, contentReplication: averageArray(tmp[veracity]) });
});

tmp = {};

finalContentRepDistribs.forEach((ctRD) => {
  ctRD.data.forEach((entity) => {
    if (tmp[entity.veracity]) {
      tmp[entity.veracity].push(entity.contentReplication);
    } else {
      tmp[entity.veracity] = [entity.contentReplication];
      veracities.push(entity.veracity);
    }
  });
});

veracities.forEach((veracity) => {
  dataFinal.push({ veracity, contentReplication: averageArray(tmp[veracity]) });
});
console.log('\x1b[34m%s\x1b[0m', `Simulation completed in ${Math.trunc((new Date().getTime() - start) / 1000)} seconds`);

// EXPORT RESULTS
jsonfile.writeFile('results/Witness_InitialContentReplicationAveraged.json', initialCtRepDistribAvg, { spaces: 2, EOL: '\r\n' });
console.log('\x1b[36m%s\x1b[0m', 'Initial content replication averaged file written');
jsonfile.writeFile('results/Witness_FinalContentReplicationAveraged.json', finalCtRepDistribAvg, { spaces: 2, EOL: '\r\n' });
console.log('\x1b[36m%s\x1b[0m', 'Final content replication averaged file written');
