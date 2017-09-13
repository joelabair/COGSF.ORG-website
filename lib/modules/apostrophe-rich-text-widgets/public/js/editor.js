apos.define('apostrophe-rich-text-widgets-editor', {
	construct: function(self, options) {
		self.beforeCkeditorInline = function() {
			// Mess around with the `config` object about to be passed to CKEditor
			self.config.removePlugins = '';
			// Disable Underline (as happens by default), but leave
			// Superscript and Subscript enabled as potential toolbar items
			self.config.removeButtons = '';
			//console.log(self.config);
		};
	}
});
