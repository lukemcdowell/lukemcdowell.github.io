const https = require('https');

exports.handler = async (event) => {
    try {
        const CLIENT_ID = process.env.CLIENT_ID;
        const CLIENT_SECRET = process.env.CLIENT_SECRET;
        const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

        if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
            console.error('Set CLIENT_ID and CLIENT_SECRET and REFRESH_TOKEN before running the lambda.');
            process.exit(1);
        }

        const accessToken = await getAccessToken(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN);

        const currentTrack = await getCurrentlyPlaying(accessToken);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(currentTrack)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

function getAccessToken(clientId, clientSecret, refreshToken){
    return new Promise((resolve, reject) => {
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const postData = `grant_type=refresh_token&refresh_token=${refreshToken}`;

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
                    const response = JSON.parse(data);
                    resolve(response.access_token);
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

function getCurrentlyPlaying(accessToken) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.spotify.com',
            path: '/v1/me/player/currently-playing',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const track = JSON.parse(data);
                    resolve({
                        isPlaying: track.is_playing,
                        type: track.currently_playing_type,
                        song: track.item?.name,
                        artist: track.item.artists?.map(a => a.name).join(', '),
                        href: track.item.external_urls?.spotify,
                    });
                } else if (res.statusCode === 204) {
                    resolve({ isPlaying: false, type: 'silence' });
                } else {
                    reject(new Error(`Spotify API error: ${res.statusCode}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}
