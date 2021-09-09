/* eslint-disable no-undef */
import 'jasmine';

import { DEFAULT_SCORE } from '../src/modules/Constant';
import Content from '../src/modules/Content';
import { Nature, User } from '../src/modules/User';

let content:Content;
let user: User;

describe('UserImplementation', () => {
  beforeAll(() => {
    user = new User();
    content = new Content(user);
  });
  it('should initiate default values of 1 content', () => {
    expect(content.author).toEqual(user);
    expect(content.veracity).toBeGreaterThanOrEqual(0);
    expect(content.veracity).toBeLessThanOrEqual(100);
    expect(content.score).toEqual(user.score);
    expect(content.impact).toEqual(user.followers.length);
  });
});
