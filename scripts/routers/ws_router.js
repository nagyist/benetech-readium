// This is the router used by the web served version of readium
// This router is used in the book view of the chrome extension build of readium
Readium.Routers.ViewerRouter = Backbone.Router.extend({

	routes: {
		"viewer.html?book=:key": "openBook",
		"*splat": "splat_handler"
	},

	openBook: function(key) {

		// Ask the server for the book's data
		var self = this;
		$.ajax({
			url: 'http://martinq-laptop.local:9000/bookInfo?title=' + key,
			dataType: 'json',
			success: function(data, textStatus, jqXHR) {
				console.log(data);
				self.initViewer(data);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log(errorThrown);
				self.initViewer(null);
			}
		});
	},

	initViewer: function(book_data) {
		if(book_data) {
			// initialize the viewer for that book
			window._epub = new Readium.Models.EPUB(book_data);
			window._epubController = new Readium.Models.EPUBController(_.extend({epub : window._epub}, book_data));
			window._applicationView = new Readium.Views.ViewerApplicationView({
				model: window._epubController
			});
			window._applicationView.render();
		}
		else {
			// did not find the book in our library
			alert("The book you requested does not exist");
		}

	},

	splat_handler: function(splat) {
		console.log(splat)
	}

});