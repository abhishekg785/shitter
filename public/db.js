/**
 * indexdb using idb
 */

async function getDB() {
    try {
        const db = await idb.openDB('shitter', 1, {
            upgradeDB(db) {
                db.createObjectStore('tweets')
            }
        });

        return db;
    } catch (err) {
        console.log('idb: error occurred while opening db', err);
    }
}

async function putTweet(tweet, key) {
    try {
        const db = await getDB();

        console.log('idb: putting tweet', tweet, key);
        await db.put('tweets', tweet, key);
    } catch (err) {
        console.log('idb: error occurred while putting tweet', err);
    }
}

async function getTweet(key) {
    try {
        const db = await getDB();

        console.log('idb: getting tweet with key', key);
        const tweet = await db.get('tweets', key);

        return tweet;
    } catch (err) {
        console.log('idb: error occurred while putting tweet', err);
    }
}

async function getAllTweets() {
    try {
        const db = await getDB();

        console.log('idb: getting tweets');
        const keys = await db.getAllKeys('tweets');

        const tweets = await Promise.all(
            keys.map(key => {
                return db.get('tweets', key);
            })
        );

        return tweets;
    } catch (err) {
        console.log('idb: error occurred while putting tweet', err);
    }
}
