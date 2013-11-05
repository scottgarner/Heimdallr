"use strict";

// Based on https://github.com/mauricesvay/node-wifiscanner/

var exec = require('child_process').exec;
var plist = require('plist');

var airportCommand = '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport';
var airportArguments = ' -s -x'

function scan(callback) {

 	exec(airportCommand + airportArguments,{maxBuffer: 500*1024}, function(err, stdout, stderr){
 		
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

		callback(networks);

	});
}

exports.scan = scan;

