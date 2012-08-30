var fs        = require('fs');
var express   = require('express');

/* Load coffee files instead of js files using require.js */
require('coffee-script');


/* This file is pretty simple. Host socket.io and the document manager */

var app = express.createServer();
var dm        = new (require('./collaboration-manager'))(app);

var port = process.env["app_port"] || process.argv[2] || 3000;
console.log('Listening on port ' + port);
app.listen(port);


