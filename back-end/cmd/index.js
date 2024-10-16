require('dotenv').config();

const express = require('express');

const app = express();

app.listen(process.env.PORT, () => {
    console.log('server running at http://localhost:' + process.env.PORT);
    require('./worker');
});