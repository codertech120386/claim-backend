const express = require('express');
const cors = require('cors');

const sessionRoutes = require('./routes');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/sessions', sessionRoutes);

module.exports = app;
