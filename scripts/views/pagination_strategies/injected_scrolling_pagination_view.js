Readium.Views.InjectedScrollingPaginationView = Readium.Views.PaginationViewBase.extend({

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function(options) {
		// call the super ctor
		Readium.Views.PaginationViewBase.prototype.initialize.call(this, options);
		this.page_template = Handlebars.templates.injected_scrolling_page_template;
	},

	render: function(goToLastPage, hashFragmentId) {
		var that = this;
		if (this.model.getCurrentSection().content == null) {
			this.model.getCurrentSection().fetch({success:function(model, response) { that.renderInternal(goToLastPage, hashFragmentId);}});
		} else {
			this.renderInternal(goToLastPage, hashFragmentId);
		}
		return [this.model.get("spine_position")];
	},

	renderInternal: function(goToLastPage, hashFragmentId) {
		var that = this;
		var json = this.model.getCurrentSection().toJSON();
		var htmlBody = this.model.getCurrentSection().content;

		this.$('#container').html( this.page_template(json) );

		this.$('#readium-scrolling-content').on("load", function(e) {

			// Important: Firefox doesn't recognize e.srcElement, so this
			// needs to be checked for whenever it's required.
			if (!e.srcElement) e.srcElement = this;
			e.srcElement.contentDocument.documentElement.innerHTML = htmlBody;
			that.iframeLoadCallback(e);
			that.setFontSize();
			that.injectTheme();

			if (hashFragmentId) {
				that.goToHashFragment(hashFragmentId);
			} else {

				if(goToLastPage) {
					// go to last page
				} else {
					// go to top
				}
			}
		});
	},

	getBody: function() {
		return this.$('#readium-scrolling-content').contents()[0].documentElement;
	},

	setFontSize: function() {
		var size = this.model.get("font_size") / 10;
		$(this.getBody()).css("font-size", size + "em");
	},

	goToHashFragment: function(hashFragmentId) {
		// stub for now
		return;
	},
	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

	// Description: sometimes these views hang around in memory before
	//   the GC's get them. we need to remove all of the handlers
	//   that were registered on the model
	destruct: function() {
		// call the super destructor
		Readium.Views.PaginationViewBase.prototype.destruct.call(this);
	}
});