import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from 'node:path';

export class CurrentlyPlayingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps){
    super(scope, id, props)

    const table = new dynamodb.Table(this, 'LastPlayedTrackTable', {
      tableName: 'LastPlayedTrack',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const fn = new lambda.Function(this, 'CurrentlyPlayingFunction', {
      functionName: 'CurrentlyPlayingFunction',
      description: 'Lambda function to get currently playing information from Spotify API',
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda-handler')),
      environment: {
        TABLE_NAME: table.tableName,
        CLIENT_ID: process.env.CLIENT_ID!,
        CLIENT_SECRET: process.env.CLIENT_SECRET!,
        REFRESH_TOKEN: process.env.REFRESH_TOKEN!
      }
    });

    table.grantReadWriteData(fn);

    const api = new apigw.RestApi(this, 'CurrentlyPlayingApi', {
      restApiName: 'CurrentlyPlayingApi',
      description: 'GET endpoint for currently playing Lambda Function',
      deploy: true,
      // need to create a CLoudWatch Role to enable logging
      // deployOptions: {
      //   loggingLevel: apigw.MethodLoggingLevel.INFO,
      //   dataTraceEnabled: true,
      //   metricsEnabled: true,
      // }
    });
    const currentlyPlaying = api.root.addResource('currently-playing');
    currentlyPlaying.addCorsPreflight({
      allowOrigins: [
        'http://localhost:4321',
        'https://lukemcdowell.github.io'
      ],
      allowMethods: [ 'GET', 'OPTIONS' ],
      allowHeaders: [ 'x-api-key' ],
    });
    const getIntegration = new apigw.LambdaIntegration(fn, {
      proxy: true
    });
    currentlyPlaying.addMethod('GET', getIntegration, {
      apiKeyRequired: true,
    });

    const apiKey = api.addApiKey('ApiKey');

    // rate limiting
    const plan = api.addUsagePlan('UsagePlan', {
      name: 'BasicUsagePlan',
      throttle: {
        rateLimit: 10,
        burstLimit: 2,
      },
      quota: {
        limit: 1000,
        period: apigw.Period.MONTH,
      },
    });
    plan.addApiKey(apiKey);
    plan.addApiStage({ stage: api.deploymentStage });
  }
}
