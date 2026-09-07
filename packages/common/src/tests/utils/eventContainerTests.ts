import { expect } from "chai";
import { EventContainer } from "../../utils";

describe("EventContainer", () => {
  it("should support subscribing", () => {
    let firedCount = 0;
    const container = new EventContainer();
    container.subscribe(() => firedCount++);
    container.fire(undefined);
    expect(firedCount).to.equal(1);
  });

  it("should pass in the arg when firing", () => {
    let capturedArg: string = "";
    const container = new EventContainer<string>();
    container.subscribe(arg => capturedArg = arg);
    container.fire("test");
    expect(capturedArg).to.equal("test");
  });

  it("should only fire the subscription once if subscribed multiple times with the same subscription", () => {
    let firedCount = 0;
    const subscription = () => firedCount++;
    const container = new EventContainer();
    container.subscribe(subscription);
    container.subscribe(subscription);
    container.fire(undefined);
    expect(firedCount).to.equal(1);
  });

  it("should support unsubscribing", () => {
    let firedCount = 0;
    const subscription = () => firedCount++;
    const container = new EventContainer();
    container.subscribe(subscription);
    container.unsubscribe(subscription);
    container.fire(undefined);
    expect(firedCount).to.equal(0);
  });

  it("should fire in subscription order", () => {
    const order: number[] = [];
    const container = new EventContainer();
    container.subscribe(() => order.push(1));
    container.subscribe(() => order.push(2));
    container.subscribe(() => order.push(3));
    container.fire(undefined);
    expect(order).to.deep.equal([1, 2, 3]);
  });

  it("should still fire the following subscriptions when one unsubscribes itself while firing", () => {
    const order: number[] = [];
    const container = new EventContainer();
    const first = () => {
      order.push(1);
      container.unsubscribe(first);
    };
    container.subscribe(first);
    container.subscribe(() => order.push(2));
    container.fire(undefined);
    container.fire(undefined);
    expect(order).to.deep.equal([1, 2, 2]);
  });
});
