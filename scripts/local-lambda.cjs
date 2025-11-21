const {handler} = require("../infra/lib/lambda-handler/handler.js");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    console.error('Set CLIENT_ID and CLIENT_SECRET and REFRESH_TOKEN before running the script.');
    process.exit(1);
}

async function testLambda() {
    console.log('Testing Lambda locally...\n');

    try {
        const event = {
            httpMethod: 'GET',
            path: '/currently-playing',
            headers: {},
            queryStringParameters: null
        };

        const result = await handler(event);

        console.log('Status Code:', result.statusCode);
        console.log('Response:', JSON.parse(result.body));
    } catch (error) {
        console.error('Error:', error);
    }
}

testLambda();
