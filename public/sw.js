const version = 17;

self.importScripts('https://unpkg.com/idb@4.0.4/build/iife/index-min.js', 'db.js');

self.addEventListener('install', (event) => {
    event.waitUntil(
        precache()
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        cleanCache()
    )
});

self.addEventListener('fetch', async (event) => {
    const requestUrl = new URL(event.request.url);

    if ((requestUrl.hostname === location.hostname) && event.request.method === 'GET') {
        event.respondWith(
            handleSameDomainRequest(event.request)
        )
    }

    if (requestUrl.hostname === 'unpkg.com') {
        event.respondWith(
            handleAssets(event.request)
        )
    }
});

async function precache() {
    console.log('sw:precache: caching static assets');
    const cache = await caches.open(`shitter-assets-${version}`);

    await cache.addAll([
        '/',
        '/main.js',
        '/offline',
        '/manifest.json',
        '/icons/icon_512.png',
        '/db.js',
        'https://unpkg.com/idb@4.0.4/build/iife/index-min.js',
    ]);
    console.log('sw:precache: static assets cached successfully');
}

const expectedCache = [
    `shitter-assets-${version}`,
    `shitter-tweets`,
];

async function cleanCache() {
    console.log('sw:cleanCache: cleaning unused cache');
    const cacheKeys = await caches.keys();

    await Promise.all(
        cacheKeys.filter(cache => {
            if (/^shitter/.test(cache) && expectedCache.indexOf(cache) === -1) {
                return caches.delete(cache);
            }
        })
    );

    console.log('sw:cleanCache: unused cache clean success');
}

async function handleSameDomainRequest(request) {
    console.log('sw:handleSameDomainRequest: fetching request for', request.url);

    if (request.url.includes('/tweets')) {
        const response = await handleTweetData(request);

        return response;
    } else if (['document', 'script'].includes(request.destination)){
        const response = await handleAssets(request);

        return response;
    }
}

async function handleTweetData(request) {
    try {
        console.log('sw:handleTweetData: fetching tweets');
        const response = await fetch(request);
        console.log('sw:handleTweetData: tweets fetched', response);

        console.log('sw:handleTweetData: caching fetched tweets');
        const cache = await caches.open('shitter-tweets');
        await cache.put(request, response.clone());

        return response;
    } catch (err) {
        console.log('sw:handleTweetData: error occurred while fetching tweets');

        console.log('sw:handleTweetData: checking for tweets in cache');
        const response = await caches.match(request);

        if (response) {
            console.log('sw:handleTweetData: found tweets in cache');
            return response;
        } else {
            console.log('sw:handleTweetData: no tweets found in cache');
            return new Response('no-match');
        }
    }
}

async function handleAssets(request) {
    console.log('sw:handleAssets: getting data from cache for', request.url);
    const response = await caches.match(request);

    if (response) {
        console.log('sw:handleAssets: found data in cache for', request.url);

        return response;
    } else {
        console.log('sw:handleAssets: no data found in cache for', request.url);

        return new Response('no-match');
    }
}

self.addEventListener('sync', (event) => {
    if (event.tag === 'post-tweet') {
        event.waitUntil(
            syncTweets()
        )
    }
});

// get all the unsync tweets from indexdb
// post them to server
async function syncTweets() {
    try {
        const tweets = await getAllTweets();

        const unsyncTweets = tweets.filter(tweet => !tweet.sync);
        console.log('sw: syncTweets: tweets to sync', unsyncTweets);

        await Promise.all(
            unsyncTweets.map(tweet => {
                return fetch('/tweets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(tweet),
                }).then(() => {
                    console.log('sw: syncTweets: tweet has been posted', tweet);
                    return putTweet({ ...tweet, sync: true }, tweet.id);
                })
            })
        )
    } catch (err) {
        console.log('sw: syncTweets: error occurred while syncing tweets', err);

        return Promise.reject();
    }
}
