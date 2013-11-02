var http = require('http');
var path = require('path');
var exec = require('child_process').exec;
var plist = require('plist');

var osc = require('node-osc');
var client = new osc.Client('127.0.0.1', 9001);

var airport = '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s -x';
var iwlist = "iwlist wlan0 scan";

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

 	osxScan();

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
		return osxScan();
		case 'linux':
		return linuxScan();
		default:
		return -1;
	}

}

function osxScan() {

 	exec(airport + ' -s -x', {maxBuffer: 500*1024}, function(err, stdout, stderr){
 		
 		if (err) {
 			console.log("Error encountered.");
 			return;
 		}

 		var scanData;
 		try {
 			scanData = plist.parseStringSync(stdout);
 		} catch (e) {
 			console.log("Error encountered during parse.");
 			return;
 		}

 		console.log( "Found " + scanData.length + " networks.");
 		scanData = scanData.sort(function(a, b) {return b.RSSI - a.RSSI});
 		if (scanData.length <= 0) return;

 		console.log("Sending data.");

 		var networks = [];

 		for (var i = 0; i < scanData.length; i++) {
 			var ap = scanData[i];

			var quality;
			if(ap.RSSI <= -100)
				quality = 0;
			else if(ap.RSSI >= -50)
				quality = 100;
			else
				quality = 2 * (ap.RSSI + 100);	     
			quality /= 100.0;   	

			var network = {
				ssid: ap.SSID,
				bssid: ap.BSSID,
				channel: ap.CHANNEL,
				rssi: ap.RSSI,					
				noise: ap.NOISE,
				quality: quality
			}

			networks.push(network);
		}

		send(networks);

	});
}

function linuxScan() {

 	exec(iwlist, {maxBuffer: 500*1024}, function(err, stdout, stderr) {

 		if (err) {
 			console.log("Error encountered.");
 			return;
 		}

		for (var i=0; i<out.length; i++) {
			var line = out[i].trim();
		}

 	});

}