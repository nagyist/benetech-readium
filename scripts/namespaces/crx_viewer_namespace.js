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
			$('#bar-logo').attr('href', BookshareUtils.resolveEnvironment('https://www.bookshare.org/'));
			_router = new Readium.Routers.ViewerRouter();

			if (window.chrome && !window.chrome.app.isInstalled) {
				var options = Readium.Models.ReadiumOptions.getInstance();
				if (false == !!options.get('decline_extension')) {
					$('#install-extension-but').click(
						function(e) {
							chrome.webstore.install();
						});
					$('#no-thanks-but').click(
						function(e) {
							options.set('decline_extension', true);
							options.save();
							$('#chrome-extension-install').modal('hide');
							window.Readium.Start();
						});
					$('#chrome-extension-install').modal();
				} else {
					this.Start();
				}
			} else {
				this.Start();
			}
		}
	},

	Start: function() {
		Backbone.history.start({pushState: true});
	}
};

$(function() {
	// call the initialization code when the dom is loaded
	window.Readium.Init();
});