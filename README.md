## Shitter
Note: Code is bad, just for learning purposes.

Shitty version of something like twitter (Nah!)

Implemented in vanilla JS.

What does it do ?

    PWA, can be installed and work offline

    Supports background sync using service workers , so if you go offline and post something, do not worry, service worker will take care of it and post it once you are online.

    Use caches api, to store static assets.

    Use indexdb to store your tweets.

    Use `idb` lib to work with indexdb.

How to run:

Install dependencies:
```
    npm install
```

Run server
```
    node server.js or nodemon server.js
```

will start serving on port 4500, open localhost:4500 in your browser.


### Additional info

branches to look out for:

`background_sync` : contains basic code to sync tweets with server when user go offline and comes back online using background sync in sw.

Hope it works :p
