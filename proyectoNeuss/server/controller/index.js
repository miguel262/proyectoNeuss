const express = require('express');
const app = express();

app.use(require("./customer"));
app.use(require("./admin"));
app.use(require("./course"));
app.use(require("./login"));
app.use(require("./order"));
app.use(require("./upload"));
app.use(require("./image"));

module.exports = app;