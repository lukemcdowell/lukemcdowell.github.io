#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { CurrentlyPlayingStack } from '../lib/currently-playing-stack';

const app = new cdk.App();
new CurrentlyPlayingStack(app, 'LastPlayedStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  description: "Infra for Last Played lambda and endpoint"
});
