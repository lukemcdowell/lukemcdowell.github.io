import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { InfraStack } from '../lib/infra-stack';

describe('InfraStack', () => {
    test('creates a Lambda function and an API Gateway', () => {
        const app = new cdk.App();
        const stack = new InfraStack(app, 'TestStack');

        const template = Template.fromStack(stack);

        // Check Lambda function exists
        template.hasResourceProperties('AWS::Lambda::Function', {
            Handler: 'index.handler',
            Runtime: Match.anyValue(),
        });

        // Check API Gateway exists
        template.hasResourceProperties('AWS::ApiGateway::RestApi', {
            Name: 'HelloApi',
        });

        // Check an ANY method exists and uses AWS_PROXY integration
        template.hasResourceProperties('AWS::ApiGateway::Method', {
            HttpMethod: 'ANY',
            Integration: {
                Type: 'AWS_PROXY',
            },
        });
    });
});
