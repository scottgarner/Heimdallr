var voices = 9.0;

var osc = require('node-osc');
var client = new osc.Client('127.0.0.1', 9001);

var exec = require('child_process').exec;

var plist = require('plist');

var airport = '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport';

update();

setInterval(function() {

	update();

}, 10000);

function update() {

	console.log("Scanning networks...");

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
	        }

	       	console.log( "Found " + scanData.length + " networks.");
	        scanData = scanData.sort(function(a, b) {return b.RSSI - a.RSSI});
	        if (scanData.length <= 0) return;

	        console.log("Sending data.");

	        var step = parseInt(scanData.length/voices);
	        for (var i = 0; i < voices; i++) {
	        	var index =  step * i;
	        	var ap = scanData[index];

	        	//ap.SSID
	        	//ap.SSID_STR
	        	//ap.NOISE
	        	//ap.RSSI
	        	//ap.BSSID
	        	//ap.CHANNEL

	        	var quality = (parseInt(ap.RSSI) + 100) / 50.0;
	        	var note = parseInt((quality * (108 - 21)) + 21);

	        	client.send('/voice', i,  ap.SSID,  quality, note);

	        }
	    });

}