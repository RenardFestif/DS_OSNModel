import Content from '../modules/Content';
import { OSN } from '../modules/Osn';
import { User } from '../modules/User';

const osn = new OSN();
const usr1 = new User();
const usr2 = new User();
const usrs = [usr1, usr2];

let i: number = 0;
let count: number = 0;
for (i; i < 20; i++) {
  const c = new Content(usr1);
  count += c.veracity;
}
console.log(count / i);
