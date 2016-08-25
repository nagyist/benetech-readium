// This is the router used by the web served version of readium
// This router is used in the book view of the chrome extension build of readium
Readium.Routers.ViewerRouter = Backbone.Router.extend({

	routes: {
        // backbone 0.9.1 does not yet support optional parameters, must be slash separated.
        "viewer.html?book=:key": "openBook",
        "load2learn/viewer.html?book=:key": "openBook",
		"*splat": "splat_handler"
	},

	openBook: function(key) {
		// Ask the server for the book's data
		var self = this;

		var ajaxParams = {
			url: BookshareUtils.resolveEnvironment(BookshareUtils.http + 'www.bookshare.org/bookInfo?titleInstanceId=' + key),
			dataType: 'json',
			crossDomain: true,
			xhrFields: {
				withCredentials: true
			},
			success: function(data, textStatus, jqXHR) {
				self.initViewer(data);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				self.handleError(key, jqXHR);
			}
		};

		if (BookshareUtils.isIE9()) {
			ajaxParams.dataType = 'jsonp';
			ajaxParams.xhrFields = null;
		}

		$.ajax(ajaxParams);
	},

	initViewer: function(book_data) {
		// initialize the viewer for that book
		console.log("Initializing Book Viewer");
		window._epub = new Readium.Models.EPUB(book_data);
		window._epubController = new Readium.Models.EPUBController(_.extend({epub : window._epub}, book_data));
		window._applicationView = new Readium.Views.ViewerApplicationView({
			model: window._epubController
		});
        
		window._applicationView.render();
	},

	handleError: function(key, jqXHR) {
		var params = {};
		var code;

		switch(jqXHR.status) {
			case 401:
				code = 'integration_error_401';
				params['loginUrl'] = BookshareUtils.resolveEnvironment(BookshareUtils.http + 'www.bookshare.org/');
				break;
			case 403: code = 'integration_error_403'; break;
			case 404:
				code = 'integration_error_404';
				params['titleDetailPageUrl'] = BookshareUtils.resolveEnvironment(BookshareUtils.http + 'www.bookshare.org/browse/book/' + key);
				break;
			default: code = 'integration_error'; break;
		}
		BookshareUtils.raiseSystemAlert(code, params);
	},

	splat_handler: function(splat) {
		console.log(splat)
	}

});