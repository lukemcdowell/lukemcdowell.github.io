# Currently Playing Lambda and API

CDK Stack to create a Lambda function and API Gateway to return the currently playing or last played song from Spotify.

The endpoint is secured using an API key. There is a rate limit of 10 requests per minute.

The Lambda function uses the Spotify Web API to fetch the currently playing song. Spotify refresh token provided as an environment variable.

## Useful commands

* `npm run build` *  compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy` * deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
* `npx cdk destroy` destroy this stack from your default AWS account/region

## Creating a Lambda function and API Gateway and Deploying

- [tutorial](https://docs.aws.amazon.com/lambda/latest/dg/lambda-cdk-tutorial.html)
- auth to AWS
- `npm run build`
- `cdk boostrap` - first time only
- `cdk deploy`
