/**
 * Event container subscription type
 */
export type EventContainerSubscription<EventArgType> = (arg: EventArgType) => void;

/**
 * Event container for event subscriptions.
 */
export class EventContainer<EventArgType = undefined> {
  // a set keeps insertion order and makes subscribe/unsubscribe O(1), which matters
  // because some containers get one subscription per source file in the project
  readonly #subscriptions = new Set<EventContainerSubscription<EventArgType>>();

  /**
   * Subscribe to an event being fired.
   * @param subscription - Subscription.
   */
  subscribe(subscription: EventContainerSubscription<EventArgType>) {
    this.#subscriptions.add(subscription);
  }

  /**
   * Unsubscribe to an event being fired.
   * @param subscription - Subscription.
   */
  unsubscribe(subscription: EventContainerSubscription<EventArgType>) {
    this.#subscriptions.delete(subscription);
  }

  /**
   * Fire an event.
   */
  fire(arg: EventArgType) {
    for (const subscription of this.#subscriptions)
      subscription(arg);
  }
}
