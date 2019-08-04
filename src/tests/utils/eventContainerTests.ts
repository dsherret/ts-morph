import { expect } from "chai";
import { EventContainer } from "../../utils";

describe(nameof(EventContainer), () => {
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
});
