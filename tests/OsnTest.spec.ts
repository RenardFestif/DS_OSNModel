/* eslint-disable no-undef */
import 'jasmine';
import { OSN, Policy, State } from '../src/modules/Osn';
import { User } from '../src/modules/User';

let osn: OSN;
let u1: User; let u2: User; let
  u3: User;

describe('OSNImplementation', () => {
  beforeEach(() => {
    User.count = 0;
    u1 = new User();
    u2 = new User();
    u3 = new User();

    osn = new OSN();

    osn.addUser(u1);
    osn.addUsers([u2, u3]);
  });

  it('should initiate default values of 1 OSN', () => {
    expect(osn.users).toEqual([u1, u2, u3]);
    expect(osn.observers).toEqual([]);
    expect(osn.state).toEqual(State.IDDLE);
    expect(osn.policy).toEqual(Policy.DEFAULT);
    expect(osn.message).toBeNull();
  });

  it('should add users', () => {
    expect(osn.users.length).toEqual(3);
  });

  it('should get 1 user by id', () => {
    expect(osn.getUser(u1.id)).toEqual(u1);
  });

  it('should updates the follower and follows table after a user follows another', () => {
    osn.follow(u1, u2);
    expect(u1.follows).toEqual([u2]);
    expect(u2.followers).toEqual([u1]);
  });

  it('should throw an exception when one of the users is not registred on the OSN [Follow]', () => {
    const notRegistredUser = new User();
    expect(() => { osn.follow(notRegistredUser, u2); }).toThrow(new Error('One of the specified user is not registered in the OSN'));
  });

  it('should post content', () => {
    osn.post(u1);
    expect(osn.feed.length).toEqual(1);
  });
});
