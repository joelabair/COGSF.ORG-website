"use strict";

var SparkPost = require('sparkpost');
var util = require('util');
var nl2br  = require('nl2br');
var template = null;
var client = new SparkPost();  /* key is stored in SPARKPOST_API_KEY environment variable */

var getTemplate = function(callback) {
	if (typeof callback !== 'function') {
		console.error("A callback i required!");
		return process.exit(1);
	}
	if (template) {
		return callback(null, template);
	}
	client.templates.get(process.env.COGSF_TMPLT_ID, function(err, res) {
		if (err) {
			console.error(util.format('SparkPost template fetch error: %s', err));
			return callback(err);
		} else {
			if ('results' in res) {
				template = res.results;
				console.log('%s: Email Template Retrieved...  Ready.', Date(Date.now()));
				callback(null, template);
			}
			else {
				console.log("%s: Email Template Response Parse Error!", Date(Date.now()));
				callback(new Error('Email Template Response Parse Error'));
			}
		}
	});
};

// prefetch it
getTemplate(function() {});


module.exports = function(piece, callback) {

	getTemplate(function(err, template) {
		if (err) {
			return callback(err);
		}

		var data = {
			"name": piece.name,
			"email": piece.email,
			"subject": piece.title,
			"message": nl2br(piece.body),
			"rawmessage": piece.body,
			"timestamp": Date().toString()
		};

		var reqOpts = {
			options: template.options,
			recipients: [{
				address: {
					"email": process.env.COGSF_EMAIL_A,
					"name": process.env.COGSF_NAME_A
				}
			},{
				address: {
					"email": process.env.COGSF_EMAIL_B,
					"name": process.env.COGSF_NAME_B
				}
			}],
			content: template.content,
			substitution_data: data
		};

		reqOpts.content['reply_to'] = piece.name + " <"+piece.email+">";
		reqOpts.content['subject'] = piece.title;

		client.transmissions.send(reqOpts, function(err, response) {
			if (err) {
				console.log('A message transmission error occurred: ' + err.name + ' - ' + err.message);
				callback(err);
			} else {
				console.log('Message:', data);
				console.log('Result:', response.results);
				callback();
			}
		});
	});

};
