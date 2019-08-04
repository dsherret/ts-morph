/**
 * Event container subscription type
 */
export type EventContainerSubscription<EventArgType> = (arg: EventArgType) => void;

/**
 * Event container for event subscriptions.
 */
export class EventContainer<EventArgType = undefined> {
    private readonly subscriptions: EventContainerSubscription<EventArgType>[] = [];

    /**
     * Subscribe to an event being fired.
     * @param subscription - Subscription.
     */
    subscribe(subscription: EventContainerSubscription<EventArgType>) {
        const index = this.getIndex(subscription);
        if (index === -1)
            this.subscriptions.push(subscription);
    }

    /**
     * Unsubscribe to an event being fired.
     * @param subscription - Subscription.
     */
    unsubscribe(subscription: EventContainerSubscription<EventArgType>) {
        const index = this.getIndex(subscription);
        if (index >= 0)
            this.subscriptions.splice(index, 1);
    }

    /**
     * Fire an event.
     */
    fire(arg: EventArgType) {
        for (const subscription of this.subscriptions)
            subscription(arg);
    }

    private getIndex(subscription: EventContainerSubscription<EventArgType>) {
        return this.subscriptions.indexOf(subscription);
    }
}
