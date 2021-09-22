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

export function snapshot(osn : OSN): IContentReplicationDistribJSON {
  const data : [{veracity: number, contentReplication:number}] = [] as unknown as [{veracity: number, contentReplication:number}];
  const snapshot : IContentReplicationDistribJSON = { data };

  osn.feed.forEach((content) => {
    const { veracity, impact } = content;
    snapshot.data.push({ veracity, contentReplication: impact });
  });

  return snapshot;
}
