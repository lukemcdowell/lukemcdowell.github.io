const https = require('https');
const { DynamoDBClient, PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamo = new DynamoDBClient();
const TABLE = process.env.TABLE_NAME;

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

        if (currentTrack) {
            await saveLastTrack(currentTrack);
            return success(currentTrack);
        }

        // nothing playing -> fetch cached track
        const cached = await loadLastTrack();
        return success(cached ?? { message: "No track cached yet" });

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

function success(body) {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(body)
    };
}

async function saveLastTrack(track) {
    await dynamo.send(new PutItemCommand({
        TableName: TABLE,
        Item: {
            id: { S: "last" },
            data: { S: JSON.stringify(track) }
        }
    }));
}

async function loadLastTrack() {
    const res = await dynamo.send(new GetItemCommand({
        TableName: TABLE,
        Key: { id: { S: "last" } }
    }));

    if (!res.Item) return null;

    const songData = JSON.parse(res.Item.data.S);
    songData.isPlaying = false;
    return songData
}

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
                    resolve(null);
                } else {
                    reject(new Error(`Spotify API error: ${res.statusCode}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}
