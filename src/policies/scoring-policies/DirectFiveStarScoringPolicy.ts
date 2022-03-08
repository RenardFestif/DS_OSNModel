import { Observer } from '../../helpers/IObserver';
import { Subject } from '../../helpers/ISubject';
import { averageArray } from '../../helpers/utils/tools';
import Content from '../../modules/Content';
import { OSN, State } from '../../modules/Osn';
import { User } from '../../modules/User';

export default class DirectFiveStarScoringPolicy implements Observer {
  private translate(score : number): number {
    switch (score) {
      case 2:
        return 25;
      case 3:
        return 50;
      case 4:
        return 75;
      case 5:
        return 100;
      default:
        return 0;
    }
  }

  public update(subject: Subject): void {
    if (subject instanceof OSN && subject.state === State.SCORE) {
      // SCORING TIME

      const scorer: User = subject.message.body.arg0 as User;
      const content: Content = subject.message.body.arg1 as Content;
      const userScore : number = subject.message.body.arg2 as number;
      const scoree : User = content.author;

      /** Compute content estimated score by the scorer
       *  based on the scorer score, the new rating and current score
       */
      const estimation = (this.translate(userScore) * scorer.score) / scoree.score;

      /** Send estimation to content estimation tab if user has not scored this
       * content yet
       */
      if (!content.estimations.some((e) => e.userId === scorer.id)) {
        for (let i = 0; i < scorer.score; i++) {
          content.estimations.push({ userId: scorer.id, estimation });
        }
      }

      /** Compute average of estimations and current score to set new content score */
      const scores : number[] = [];
      content.estimations.forEach((e) => { scores.push(e.estimation); });
      scores.push(content.score);
      content.score = averageArray(scores);

      /** Compute the new General user Score  based on the content's score */
      scores.splice(0, scores.length);

      scoree.privateFeed.forEach((ctn) => { scores.push(ctn.score); });
      scoree.score = averageArray(scores);
    }
  }
}
