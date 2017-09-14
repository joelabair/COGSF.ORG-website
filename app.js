"use strict";

var util = require('util');

var config = {
	"mongo": {
		"hostString": "127.0.0.1:27017/COGSFAPS",
		"user": "apostrophe",
		"db": "COGSFAPS"
	}
};

if (process.env.APP_CONFIG) {
	config = JSON.parse(process.env.APP_CONFIG);
}

config.mongo.password = process.env.EN_MONGO_PASSWD;

var apos = require('apostrophe')({
	shortName: 'cogsabbathfellowship.org',
	title: 'cogsabbathfellowship.org',

	// See lib/modules for basic project-level configuration of our modules
	// responsible for serving static assets, managing page templates and
	// configuring user acounts.

	modules: {
		// Add custom apostrophe-modules and their respective configuration here!
		'apostrophe-db': {
			uri: util.format('mongodb://%s:%s@%s', config.mongo.user, config.mongo.password, config.mongo.hostString)
		},
		'apostrophe-express': {
			'session': {
				'secret': process.env.EN_SESSSEC
			}
		},
		'apostrophe-attachments': {
			uploadfs: {
				backend: 's3',
				secret: process.env.COGSF_S3_SEC,
				key: process.env.COGSF_S3_KEY,
				bucket: process.env.COGSF_S3_BUCKET,
				region: process.env.COGSF_S3_REGION
			}
		},
		// This configures our default page template
		'apostrophe-pages': {
			filters: {
				// Grab our ancestor pages, with two levels of subpages
				ancestors: {
					children: {
						depth: 2
					}
				},
				// We usually want children of the current page, too
				children: {
					depth: 2
				}
			}
		},
		'apostrophe-files-pages': {
			extend: 'apostrophe-pieces-pages'
		},
		'contact-form': {},
		'contact-form-widgets': {}
	}
});

//console.log(util.inspect(process.env));
