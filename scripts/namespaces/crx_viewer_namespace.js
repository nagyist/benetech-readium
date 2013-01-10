// This is the namespace and initialization code that is used by
// by the epub viewer of the chrome extension

window.Readium = {
	Models: {},
	Collections: {},
	Views: {},
	Routers: {},
	Utils: {},
	Init: function() {
		if (window.chrome && window.chrome.extension) {
			BookshareUtils.setEnvironment(window.document.referrer);
		} else {
			BookshareUtils.setEnvironment(window.location.href);
		}

		$('#bar-logo').attr('href', BookshareUtils.resolveEnvironment('https://www.bookshare.org/'));
		_router = new Readium.Routers.ViewerRouter();

		if (window.chrome && !window.chrome.extension) {
			var options = Readium.Models.ReadiumOptions.getInstance();
			var myModal = $('#chrome-extension-install');
			if (false == !!options.get('decline_extension')) {
				$('#install-extension-but').click(
					function(e) {
						chrome.webstore.install(
							'https://chrome.google.com/webstore/detail/bkfmjmjngglphchhiemnghidpnddofmo',
							function() {
								$('#crx-install-instructions').hide();
								$('#crx-install-success').show();
							},
							function() {
								$('#crx-install-instructions').hide();
								$('#crx-install-fail').show();
							}
						);
					});
				$('#no-thanks-but').click(
					function(e) {
						options.set('decline_extension', true);
						options.save();
						myModal.modal('hide');
					});
				$('#crx-install-fail-but').click(
					function(e) {
						myModal.modal('hide');
					});
				$('#crx-install-success-but').click(
					function(e) {
						window.location.reload();
					});
				// wire up Start to kick off after the dialog goes away
				myModal.on('hide', window.Readium.Start);
				myModal.modal();
			} else {
				this.Start();
			}
		} else {
			this.Start();
		}
	},

	Start: function() {
		// Detect whether IE is the current browser, and use an alternative to HTML-5 push state and backbone.js routing
		if (BookshareUtils.isIE9()) {
			var queryString = window.location.search;
			var firstQueryParam = queryString.split("&")[0];
			var epubId = firstQueryParam.split("=")[1];
			_router.openBook(epubId);
		}
		// Assumes HTML-5 compatible browser: Safari, Firefox, Chrome, IE10
		else {
			Backbone.history.start({pushState: true});
		}
	}
};

$(function() {
	// call the initialization code when the dom is loaded
	window.Readium.Init();
});