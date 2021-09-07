import { Subject } from "./ISubject";

/**
 * The Observer interface declares the update method, used by subjects.
 */
export interface Observer {
    // Receive update from subject.
    update(subject: Subject): void;
}
