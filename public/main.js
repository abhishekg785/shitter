(function(w, d) {
    const tweetForm = d.getElementById('tweetForm');
    const tweetInput = d.getElementById('tweetInput');

    const app = d.getElementById('app');
    const tweetContent = d.getElementById('tweetContent');

    async function main() {
        tweetForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            try {
                const tweetText = tweetInput.value;
                const formattedTweet = formatTweet(tweetText);

                const options = {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify(formattedTweet),
                };

                console.log('[main.js]: posting tweet', formattedTweet, options);
                const response = await fetch('/tweets', options).then(d => d.json());
                console.log('[main.js]: tweet posted success', response);

                clearTweetForm();
                appendTweetsToPage([ formattedTweet ])
            } catch (err) {
                console.log('[main.js]: error ocurred while posting the tweet', err);

                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.sync.register('post-tweet');
                    });
                }
            }
        });

        // show tweets on the page
        const tweets = await fetchTweets();
        appendTweetsToPage(tweets);

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(sw => {
                console.log('[main.js]: sw registered successfully');
            });
        }
    }

    function formatTweet(tweetText) {
        return {
            id: Date.now(),
            tweet: tweetText,
        }
    }

    function createTweetElement({ id, tweet }) {
        const tweetArticle = document.createElement('article');
        const tweetText = document.createElement('p');

        tweetText.innerText = tweet;

        tweetArticle.classList.add('tweet');
        tweetArticle.dataset.id = id;

        tweetArticle.appendChild(tweetText);

        return tweetArticle;
    }

    async function fetchTweets() {
        try {
            console.log('[main.js]: fetching tweets');
            const tweets = await fetch('/tweets').then(res => res.json());
            console.log('[main.js]: tweets fetched success', tweets);

            return tweets;
        } catch (err) {
            console.log('[main.js]: error while fetching tweets', err);
        }
    }

    function appendTweetsToPage(tweets) {
        const tweetElemets = tweets.map(createTweetElement);

        tweetElemets.forEach(tweet => {
            tweetContent.append(tweet);
        });
    }

    function clearTweetForm() {
        tweetInput.value = '';
        tweetInput.focus();
    }

    w.addEventListener('DOMContentLoaded', () => {
        main();
    });
})(window, document);
