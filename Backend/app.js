const express = require('express');

const app = express();

app.use((req, res) => {
  res.json({ Message:'requête reçue'});
});

module.exports = app;