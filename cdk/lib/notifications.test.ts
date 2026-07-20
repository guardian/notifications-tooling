import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { NotificationsToolingStack } from "./notifications";

describe("The Notifications stack", () => {
  it("matches the snapshot", () => {
    const app = new App();
    const stack = new NotificationsToolingStack(app, "Notifications", { stack: "deploy", stage: "TEST", env: { region: "eu-west-1" } }, "notifications-tooling");
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });
});
