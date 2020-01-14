const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const httpPort = process.env.SHITTER_HTTP_PORT || 4500;

const tweets = [
    { id: 1, tweet: 'where am I ?' },
    { id: 1, tweet: 'I am gonna screw up!' },
];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/offline', (req, res) => {
    res.sendFile(path.join(__dirname, 'offline.html'));
});

app.get('/tweets', (req, res) => {
    res.json(tweets);
});

app.post('/tweets', (req, res) => {
    const { id, tweet } = req.body;

    tweets.push({ id, tweet });

    res.send({ success: 'true' });
});

app.listen(httpPort, () => {
    console.log(`shitter server listening on port ${httpPort}`)
});
