import Gaussian from 'ts-gaussian';
import { Observer } from '../../helpers/IObserver';
import { Subject } from '../../helpers/ISubject';
import { assert } from '../../helpers/utils/tools';
import {
  POSTS_PER_USER, PUBLIC_POSTS, PUBLIC_SIGMA, PUBLIC_THRESHOLD,
} from '../../modules/Constant';
import Content from '../../modules/Content';
import { OSN, State } from '../../modules/Osn';
import { User } from '../../modules/User';

export default class ScoreBasedExpositionPolicy implements Observer {
  public update(subject: Subject): void {
    if (subject instanceof OSN && subject.state === State.FETCH) {
      // console.log('User updates its feed');

      const user: User = subject.message.body.arg0 as User;
      let publicPostCount = 0;
      // RESET PUBLIC FEED
      user.resetPublicFeed();

      subject.sortFeedByScoreThenContentReplication();

      // Integrity check prevent infinit loop on empty list
      if (PUBLIC_POSTS + user.follows.length * POSTS_PER_USER > subject.feed.length) {
        throw new Error('The amount of PUBLIC_POST must be lower than the total amount of posts in the OSN');
      }

      // UPDATE PUBLIC FEED
      // ADD CONTENT FROM FOLLOWED USER
      user.follows.forEach((following) => {
        following.privateFeed.forEach((content) => {
          user.publicFeed.push(content);
        });
      });

      assert(
        user.publicFeed.length === user.follows.length * POSTS_PER_USER,
        `Publicfeed length = ${user.publicFeed.length} does not match followers ${user.follows.length * POSTS_PER_USER} `,
      );
      // Mutates the aray and reverse it 1st elem is top scored
      subject.feed.reverse();

      // WE ADD N = PUBLIC_POST FROM OTHER MEMBERS PUBLICATION RANDOMLY BASED ON THEIR IMPACT
      // The content must not been already retweetted by the user
      while (user.publicFeed.length < PUBLIC_POSTS + user.follows.length * POSTS_PER_USER) {
        // eslint-disable-next-line no-loop-func
        subject.feed.forEach((content: Content) => {
          if (
            content.author !== user
            && publicPostCount < PUBLIC_POSTS
            && !user.retweets.includes(content)
            && !user.publicFeed.includes(content)
            && !user.follows.includes(content.author)
          ) {
            // console.log(content.score / 100, content.veracity);

            const distribution = new Gaussian(subject.getContentReplicationAdjustedByScore(content), PUBLIC_SIGMA ** 2);
            const rand = distribution.ppf(Math.random());
            // console.log(user.id, rand, content.impact, content.veracity);
            if (rand > PUBLIC_THRESHOLD) {
              user.publicFeed.push(content);
              publicPostCount++;
            }
          }
        });
      }

      // Public feed controlled and sorted
      user.publicFeed.sort((a, b) => a.score - b.score || a.impact - b.impact).reverse();

      assert(
        user.publicFeed.length === PUBLIC_POSTS + user.follows.length * POSTS_PER_USER,
        `Publicfeed length = ${user.publicFeed.length} does not match ${PUBLIC_POSTS + user.follows.length * POSTS_PER_USER} `,
      );
    }
  }
}
