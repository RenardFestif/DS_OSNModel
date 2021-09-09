import { Subject } from './ISubject';

/**
 * The Observer interface declares the update method, used by subjects.
 */
export interface Observer {
    // Receive update from subject.
    // eslint-disable-next-line no-unused-vars
    update(subject: Subject): void;
}
