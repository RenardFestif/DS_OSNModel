import { OSN, State } from "../../../modules/Osn";
import { Observer } from "../../IObserver";
import { Subject } from "../../ISubject";


export class ContentObserver implements Observer {
    public update(subject: Subject): void {
        if (subject instanceof OSN && subject.state === State.POST) {
            console.log('User post content');
        }
    }
}