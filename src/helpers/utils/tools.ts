import { NUMBER_USERS } from '../../modules/Constant';
import { OSN } from '../../modules/Osn';
import { Nature, User } from '../../modules/User';
import {
  IContentReplicationDistribJSON,
} from '../interfaces/IEvaluation';

export default function getRandomSubarray(arr : any[], size: number) {
  const shuffled = arr.slice(0);
  let i = arr.length;
  const min = i - size;
  let temp;
  let index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}

// export function snapshot(osn : OSN): IContentReplicationDistribJSON {
//   const data : [{veracity: number, contentReplication:number}] = [] as unknown as [{veracity: number, contentReplication:number}];
//   const snapshot : IContentReplicationDistribJSON = { data };

//   // Convert to scalable Content replication
//   const scalable = osn.getScalableContentReplication();

//   osn.feed.forEach((content) => {
//     const { veracity, impact } = content;
//     snapshot.data.push({ veracity, contentReplication: impact });
//   });

//   return snapshot;
// }

export function contentReplicationDistributionByVeracity(osn: OSN): IContentReplicationDistribJSON {
  const data : [{veracity: number, contentReplication:number}] = [] as unknown as [{veracity: number, contentReplication:number}];
  const distrib : IContentReplicationDistribJSON = { data, totalUsers: NUMBER_USERS };

  const average = (array:number[]) => array.reduce((a:number, b:number) => a + b) / array.length;
  osn.sortFeedByID();
  // eslint-disable-next-line no-undef
  const tmp = new Map();
  osn.feed.forEach((content) => {
    const { veracity, impact } = content;
    if (tmp.has(veracity)) {
      const previous = tmp.get(veracity);
      previous.push(impact);
      tmp.set(veracity, previous);
    } else { tmp.set(veracity, [impact]); }
  });

  tmp.forEach((contentRep, veracity) => {
    const avgContentRep = average(contentRep);
    distrib.data.push({ veracity, contentReplication: (avgContentRep / NUMBER_USERS) * 100 });
  });

  return distrib;
}

export function assert(condition : boolean, message: string) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}