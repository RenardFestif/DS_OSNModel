import Content from '../modules/Content';
import { OSN } from '../modules/Osn';
import { User } from '../modules/User';
import DefaultPolicy from '../policies/DefaultPolicy';

const osn = new OSN();
const usr1 = new User();
const usr2 = new User();
const usr3 = new User();
const usrs = [usr1, usr2, usr3];
osn.addUsers(usrs);
osn.follow(usr1, usr2);

osn.post(usr1);
osn.post(usr2);
osn.post(usr2);

osn.post(usr3);
osn.post(usr3);
osn.post(usr3);
osn.post(usr3);

osn.attach(new DefaultPolicy());
