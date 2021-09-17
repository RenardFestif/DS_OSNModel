import Gaussian from 'ts-gaussian';
import { Observer } from '../helpers/IObserver';
import { Subject } from '../helpers/ISubject';
import { PUBLIC_POSTS, PUBLIC_SIGMA, PUBLIC_THRESHOLD } from '../modules/Constant';
import Content from '../modules/Content';
import { OSN, State } from '../modules/Osn';
import { User } from '../modules/User';

export default class DefaultPolicy implements Observer {
  public update(subject: Subject): void {
    if (subject instanceof OSN && subject.state === State.FETCH) {
      console.log('User updates its feed');

      const user: User = subject.message.body.arg0 as User;

      // CONVERT IMPACT & SORT FEED
      subject.setImpactToScalable();

      // UPDATE PRIVATE FEED
      subject.feed.forEach((content) => {
        if (content.author === user || user.follows.includes(content.author)) {
          user.privateFeed.push(content);
        }
      });

      // UPDATE PUBLIC FEED
      subject.feed.reverse().forEach((content: Content) => {
        if (content.author === user) {
          // WE ADD THE USERS PUBLICATION
          user.publicFeed.push(content);
        } else if (user.follows.includes(content.author)) {
          // WE ADD THE FOLLOWING USERS PUBLICATIONS
          user.publicFeed.push(content);
        } else {
          // WE ADD OTHER MEMBERS PUBLICATION RANDOMLY BASED ON THEIR IMPACT
          let count = 0;
          const distribution = new Gaussian(content.impact, PUBLIC_SIGMA);
          if (distribution.ppf(Math.random()) > PUBLIC_THRESHOLD && count < PUBLIC_POSTS) {
            user.publicFeed.push(content);
            count++;
          }
        }
      });
    }
  }
}
