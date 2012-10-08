Readium.Views.InjectedScrollingPaginationView = Readium.Views.PaginationViewBase.extend({

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function(options) {
		// call the super ctor
		Readium.Views.PaginationViewBase.prototype.initialize.call(this, options);
		this.page_template = Handlebars.templates.injected_scrolling_page_template;

		// if this book does right to left pagination we need to set the
		// offset on the right
		if(this.model.epub.get("page_prog_dir") === "rtl") {
			this.offset_dir = "right";
		}
		else {
			this.offset_dir = "left";
		}

		this.model.on("change:toc_visible", this.windowSizeChangeHandler, this);
		this.model.on("repagination_event", this.windowSizeChangeHandler, this);
		this.model.on("change:current_theme", this.injectTheme, this);
		this.model.on("change:current_margin", this.marginCallback, this);
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
			that.adjustIframe();
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

	adjustIframe: function() {
		var prop_dir = this.offset_dir;
		var $frame = this.$('#readium-scrolling-content');

		this.setFrameSize();
	},

	// Rationale: on iOS frames are automatically expanded to fit the content dom
	// thus we cannot use relative size for the iframe and must set abs 
	// pixel size
	setFrameSize: function() {
		var width = this.getFrameWidth().toString() + "px";
		var height = this.getFrameHeight().toString() + "px";

		this.$('#readium-scrolling-content').attr("width", width);
		this.$('#readium-scrolling-content').attr("height", height);
		this.$('#readium-scrolling-content').css("width", width);
		this.$('#readium-scrolling-content').css("height", height);
	},

	getFrameWidth: function() {
		var width;
		var margin = this.model.get("current_margin");
		switch (margin) {
			case 1: width = 0.90; break;
			case 2: width = 0.80; break;
			case 3: width = 0.70; break;
			case 4: width = 0.60; break;
			default: width = 0.50; break;
		}
		
		return Math.floor( $('#scrolling-wrapper').width() * width );
	},

	getFrameHeight: function() {
		return $('#scrolling-wrapper').height();
	},
	windowSizeChangeHandler: function() {
		this.adjustIframe();
	},
    
	marginCallback: function() {
		this.adjustIframe();
	},

	goToHashFragment: function(hashFragmentId) {
		this.$('#readium-scrolling-content')[0].contentDocument.location.hash = hashFragmentId;
	},
	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

	// Description: sometimes these views hang around in memory before
	//   the GC's get them. we need to remove all of the handlers
	//   that were registered on the model
	destruct: function() {
		this.model.off("change:toc_visible", this.windowSizeChangeHandler);
		this.model.off("repagination_event", this.windowSizeChangeHandler);
		this.model.off("change:current_theme", this.injectTheme);
		this.model.off("change:current_margin", this.marginCallback);

		// call the super destructor
		Readium.Views.PaginationViewBase.prototype.destruct.call(this);
	}
});