apos.define('contact-form-widgets', {

	extend: 'apostrophe-widgets',

	construct: function(self, options) {

		self.play = function($widget, data, options) {

			var $form = $widget.find('[data-contact-form]');
			var schema = self.options.submitSchema;
			var piece = _.cloneDeep(self.options.piece);

			$('fieldset', $form).on('keyup', function(){
				$(this).removeClass('apos-error apos-error--required');
			});

			return apos.schemas.populate($form, self.schema, self.piece, function(err) {
				if (err) {
					alert('A problem occurred setting up the contact form.');
					return;
				}
				enableSubmit();
			});

			function enableSubmit() {
				$form.on('submit', function() {
					submit();
					return false;
				});
			}

			function submit() {
				return async.series([
					convert,
					validate,
					submitToServer
				], function(err) {
					if (err) {
						if (console) {
							console.error('Something was not right. Please review your submission.');
							console.warn(err);
						}
					} else {
						// Replace the form with its formerly hidden thank you message
						$form.replaceWith($form.find('[data-thank-you]'));
					}
				});

				function validate(callback) {
					return (function($form, schema, piece, callback){
						if (!/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( piece.email )) {
							$('fieldset[data-name="email"]', $form).addClass('apos-error apos-error--invalid');
							return callback(new Error('Not a valid email address!'));
						}
						callback();
					})($form, schema, piece, callback);
				}

				function convert(callback) {
					return apos.schemas.convert($form, schema, piece, callback);
				}

				function submitToServer(callback) {
					return self.api('submit', piece, function(data) {
						if (data.status === 'ok') {
							// All is well
							return callback(null);
						}
						// API-level error
						return callback('error');
					}, function(err) {
						// Transport-level error
						return callback(err);
					});
				}
			}
		};
	}
});
