"use strict";

var http = require('http');
var path = require('path');

var osc = require('node-osc');
var client = new osc.Client('127.0.0.1', 9001);

var darwin = require('./darwin');
var linux = require('./linux');

var voices = 9.0;

var networks = [];

/**
 * Express Setup
 */
 var express = require('express');
 var app = express();
 app.engine('.html', require('ejs').__express);
 app.set('port', process.env.PORT || 3000);
 app.set('views', __dirname + '/views');
 app.set('view engine', 'html');
 app.use(express.static(path.join(__dirname, 'public')));

 app.get('/', function(req, res){
 	res.render('index', {
 		title: "EJS example"
 	});
 });

 app.get('/networks', function (req, res) {
 	res.send(JSON.stringify(networks, null, 4));
 });

 http.createServer(app).listen(app.get('port'), function(){
 	console.log('Express server listening on port ' + app.get('port'));
 	update();
 });

 setInterval(function() {

 	update();

 }, 10000);

 function update() {

 	console.log("Scanning networks...");
 	scan();

}

function send(networks) {

    var step = parseInt(networks.length/voices);
	for (var i = 0; i < voices; i++) {
		var index =  step * i;
		var ap = networks[index];

		var note = parseInt((ap.quality * (89 - 31)) + 31);
		client.send('/voice', i,  ap.ssid,  ap.quality, note); 	
	}

}

function scan() {
	switch (process.platform) {
		case 'darwin':
			return darwin.scan(send);
		case 'linux':
			return linux.scan(send);
		default:
			console.error('Incompatible system.')
			process.exit(1);
	}

}