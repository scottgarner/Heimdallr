"use strict";

// Based on https://github.com/mauricesvay/node-wifiscanner/

var exec = require('child_process').exec;

var iwlistCommand = "iwlist";
var iwlistArguments = " wlan0 scan";

function scan(callback) {

    var patterns = {
        'bssid' : /^Cell \d+ - Address: (.*)/,
        'ssid' : /^ESSID:"(.*)"/,
        'quality' : /Quality(?:=|\:)([-\w]+)/,
        'rssi' : /Signal level(?:=|\:)([-\w]+)/
    };

 	exec(iwlistCommand + iwlistArguments, {maxBuffer: 500*1024}, function(err, stdout, stderr) {

 		if (err) {
 			console.log("iwList error encountered.");
 			return;
 		}

 		var ap = {};
 		var networks = [];

 		stdout = stdout.split('\n');
		for (var i=0; i<stdout.length; i++) {
			var line = stdout[i].trim();


			if (line.match(patterns.bssid)) {
            	networks.push(ap);
            	ap = {};
        	}

	        for (var pattern in patterns) {
	            if (line.match(patterns[pattern])) {
	                ap[pattern] = (patterns[pattern].exec(line)[1]).trim();

	                if (pattern == "quality") {
	                	ap[pattern] /= 100.0;
	                }
	            }
	        }        	

		}

		networks.push(ap);
		networks.shift();

		callback(networks);

 	});

}

exports.scan = scan;

