import { NUMBER_USERS, TOP_CONNECTED_PERCENTAGE } from '../../modules/Constant';

// Deterministic Followers Distribution
export function zipf(rank: number): number {
  const connectedTo = (((TOP_CONNECTED_PERCENTAGE / 100) * NUMBER_USERS) / rank);

  return Math.ceil(connectedTo);
}

export function pareto(x:number):void {

}
