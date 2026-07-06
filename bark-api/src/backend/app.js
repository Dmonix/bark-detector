const express = require('express');
const morgan  = require('morgan');
const barkRoutes   = require('./routes/bark');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/bark', barkRoutes);
app.use(errorHandler);

module.exports = app;
