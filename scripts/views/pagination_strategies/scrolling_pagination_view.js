Readium.Views.ScrollingPaginationView = Readium.Views.PaginationViewBase.extend({

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function(options) {
		// call the super ctor
		Readium.Views.PaginationViewBase.prototype.initialize.call(this, options);
		this.page_template = Handlebars.templates.scrolling_page_template;
	},

	render: function() {
		var that = this;
		var json = this.model.getCurrentSection().toJSON();
        var xhtml = this.model.getCurrentSection().content;

        this.$('#container').html( this.page_template(json) );
		
		this.$('.content-sandbox').on("load", function(e) {
		// Important: Firefox doesn't recognize e.srcElement, so this needs to be checked for whenever it's required.
			if (!e.srcElement) e.srcElement = this;
            // Transfer dir and lang from incoming document to iframe html element
            if (xhtml.dir && ! /^\s*$/.test(xhtml.dir)) {
                e.srcElement.contentDocument.documentElement.setAttribute("dir", xhtml.dir);
            }
            var language = xhtml.attributes.getNamedItemNS("http://www.w3.org/XML/1998/namespace","lang").value;
            if (language && ! /^\s*$/.test(language)) {
                e.srcElement.contentDocument.documentElement.setAttribute("xml:lang", language);
            }
			that.iframeLoadCallback(e);
		});

		return [this.model.get("spine_position")];
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
