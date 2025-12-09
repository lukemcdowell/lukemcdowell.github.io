const https = require('https');
const http = require('http');
const url = require('url');

// https://developer.spotify.com/dashboard
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://127.0.0.1:8888/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Set CLIENT_ID and CLIENT_SECRET in the script.');
    process.exit(1);
}

const SCOPE = 'user-read-currently-playing';

// local server to receive callback
const server = http.createServer(async (req, res) => {
    const queryObject = url.parse(req.url, true).query;

    if (queryObject.code) {
        // exchange authorization code for tokens
        const tokens = await getTokens(queryObject.code);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <html>
                <body>
                    <h1>Success!</h1>
                    <p>Your refresh token:</p>
                    <pre style="background: #f0f0f0; padding: 10px;">${tokens.refresh_token}</pre>
                    <p>Access token (expires in 1 hour):</p>
                    <pre style="background: #f0f0f0; padding: 10px;">${tokens.access_token}</pre>
                </body>
            </html>
        `);

        setTimeout(() => {
            server.close();
            process.exit(0);
        }, 1000);
    }
});

server.listen(8888, () => {
    const authUrl = `https://accounts.spotify.com/authorize?` +
        `response_type=code&` +
        `client_id=${CLIENT_ID}&` +
        `scope=${encodeURIComponent(SCOPE)}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

    console.log('Click this URL to authorize:\n');
    console.log(authUrl);
    console.log('\nWaiting for authorization...\n');
});

function getTokens(code) {
    return new Promise((resolve, reject) => {
        const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        const postData = `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

        const options = {
            hostname: 'accounts.spotify.com',
            path: '/api/token',
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Token request failed: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}
