#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { CurrentlyPlayingStack } from '../lib/currently-playing-stack';

const app = new cdk.App();
new CurrentlyPlayingStack(app, 'CurrentlyPlayingStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  description: "Infra for Currently Playing lambda and endpoint"
});
