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

    test('DynamoDB table has correct name, key schema, and billing mode', () => {
        template.hasResourceProperties('AWS::DynamoDB::Table', {
            TableName: 'LastPlayedTrack',
            KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
            BillingMode: 'PAY_PER_REQUEST',
        });
    });

    test('Lambda function has correct runtime and name', () => {
        template.hasResourceProperties('AWS::Lambda::Function', {
            Runtime: 'nodejs22.x',
            FunctionName: 'CurrentlyPlayingFunction',
        });
    });

    test('Lambda function has TABLE_NAME environment variable', () => {
        template.hasResourceProperties('AWS::Lambda::Function', {
            Environment: {
                Variables: Match.objectLike({
                    TABLE_NAME: Match.anyValue(),
                }),
            },
        });
    });

    test('Lambda has DynamoDB GetItem and PutItem IAM permissions', () => {
        template.hasResourceProperties('AWS::IAM::Policy', {
            PolicyDocument: {
                Statement: Match.arrayWith([
                    Match.objectLike({
                        Effect: 'Allow',
                        Action: Match.arrayWith([
                            'dynamodb:GetItem',
                            'dynamodb:PutItem',
                        ]),
                    }),
                ]),
            },
        });
    });

    test('CORS OPTIONS method exists on /currently-playing with MOCK integration', () => {
        template.hasResourceProperties('AWS::ApiGateway::Method', {
            HttpMethod: 'OPTIONS',
            ApiKeyRequired: false,
            Integration: {
                Type: 'MOCK',
            },
        });
    });

    test('Usage Plan is linked to API key via UsagePlanKey', () => {
        template.hasResourceProperties('AWS::ApiGateway::UsagePlanKey', {
            KeyType: 'API_KEY',
        });
    });
});
