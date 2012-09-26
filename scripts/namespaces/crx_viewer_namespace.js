// This is the namespace and initialization code that is used by
// by the epub viewer of the chrome extension

window.Readium = {
	Models: {},
	Collections: {},
	Views: {},
	Routers: {},
	Utils: {},
	Init: function() {
		_router = new Readium.Routers.ViewerRouter();
		Backbone.history.start({pushState: true});
	}
};

$(function() {
	// call the initialization code when the dom is loaded
	if (window.chrome && window.chrome.extension) {
		BookshareUtils.setEnvironment(window.document.referrer);
	} else {
		BookshareUtils.setEnvironment(window.location.href);
	}

	$('#bar-logo').attr('href', BookshareUtils.resolveEnvironment('https://www.bookshare.org/'));
	window.Readium.Init();
});