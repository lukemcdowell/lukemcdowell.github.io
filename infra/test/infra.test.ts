import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { CurrentlyPlayingStack } from '../lib/currently-playing-stack';

describe('CurrentlyPlayingStack', () => {
    let template: Template;

    beforeAll(() => {
        const app = new cdk.App();
        const stack = new CurrentlyPlayingStack(app, 'TestStack');
        template = Template.fromStack(stack);
    });

    test('Lambda function is created', () => {
        template.hasResourceProperties('AWS::Lambda::Function', {
            Handler: 'handler.handler',
            Runtime: Match.anyValue(),
            Description: 'Lambda function to get currently playing information from Spotify API',
        });
    });

    test('API Gateway REST API is created', () => {
        template.hasResourceProperties('AWS::ApiGateway::RestApi', {
            Name: 'CurrentlyPlayingApi',
        });
    });

    test('GET /currently-playing method exists and requires API key', () => {
        template.hasResourceProperties('AWS::ApiGateway::Method', {
            HttpMethod: 'GET',
            ApiKeyRequired: true,
            Integration: {
                Type: 'AWS_PROXY',
            },
        });
    });

    test('API Key is created', () => {
        template.resourceCountIs('AWS::ApiGateway::ApiKey', 1);
    });

    test('Usage Plan is created with throttle and quota', () => {
        template.hasResourceProperties('AWS::ApiGateway::UsagePlan', {
            Throttle: {
                RateLimit: 10,
                BurstLimit: 2,
            },
            Quota: {
                Limit: 1000,
                Period: 'MONTH',
            },
        });
    });
});
