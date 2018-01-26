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

		this.trackScrolling = true;

		this.model.on("change:toc_visible", this.windowSizeChangeHandler, this);
		this.model.on("repagination_event", this.windowSizeChangeHandler, this);
		this.model.on("change:current_theme", this.injectTheme, this);
		this.model.on("change:current_margin", this.marginCallback, this);
		this.model.on("change:beeline_theme", this.injectTheme, this);
		this.model.on("change:beeline_theme", this.beeLineCallback, this);

	},

	render: function(goToLastPage, hashFragmentId) {
		var that = this;
		if (this.model.getCurrentSection().content == null) {
			BookshareUtils.raiseSystemAlert('loading_content');
			this.model.getCurrentSection().fetch({success:function(model, response) { BookshareUtils.dismissSystemAlert(); that.renderInternal(goToLastPage, hashFragmentId);}});
		} else {
			this.renderInternal(goToLastPage, hashFragmentId);
		}
		return [this.model.get("spine_position")];
	},

	renderInternal: function(goToLastPage, hashFragmentId) {
		var that = this;
		var json = this.model.getCurrentSection().toJSON();
		var xhtml = this.model.getCurrentSection().content;

		this.$('#container').html( this.page_template(json) );

		this.$('#readium-scrolling-content').on("load", function(e) {

			// Important: Firefox doesn't recognize e.srcElement, so this
			// needs to be checked for whenever it's required.
			if (!e.srcElement) e.srcElement = this;
			e.srcElement.contentDocument.documentElement.appendChild(xhtml.children[0].cloneNode(true));
			e.srcElement.contentDocument.documentElement.appendChild(xhtml.children[1].cloneNode(true));
			that.adjustIframe();
			that.iframeLoadCallback(e);
			that.setFontSize();
			that.setFontFace();
			that.injectTheme();
            that.setBeeLine();
			that.getFrame().contentWindow.onscroll = that.makeScrollHandler();

			setTimeout(
				function() {
					if (hashFragmentId) {
						that.goToHashFragment(hashFragmentId);
					} else {
						that.getFrame().focus();
						if(goToLastPage) {
							that.getFrame().contentWindow.scrollBy(0, that.getBody().scrollHeight);
						} else if (that.model.get('reading_position') != null) {
							that.goToReadingPosition();
						} else {
							that.getFrame().contentWindow.scrollTo(0, 0);
							// force call on scroll handler
							that.getFrame().contentWindow.onscroll();
						}
					}
				}, 250);
		});
	},

	getBody: function() {
		return this.$('#readium-scrolling-content').contents()[0].documentElement;
	},

	getFrame: function() {
		return this.$('#readium-scrolling-content')[0];
	},

	setFontSize: function() {
		var size = this.model.get("font_size") / 10;
		$(this.getBody()).css("font-size", size + "em");
	},

	setFontFace: function() {
		var face = this.model.get("font_face");
		this.$('#readium-scrolling-content').contents().find("link#fontStyle").remove();
		if (face == 'OpenDyslexic') {
		  this.$('#readium-scrolling-content').contents().find('head').append('<link id="fontStyle" rel="stylesheet" type="text/css" href="fonts/OpenDyslexic/OpenDyslexic.css"/>');
		}
		$(this.getBody()).css("font-family", face);
	},
	
    setBeeLine: function() {
        this.commonBeelineLogic(this.$('#readium-scrolling-content').contents());
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
		this.getBody().style.overflowX = "hidden"; // prevents x-scrolling
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
		this.goToReadingPosition();
	},
    
	marginCallback: function() {
		this.adjustIframe();
		this.goToReadingPosition();
	},

	pageNumberCallback: function() {
		this.togglePageNumbers();
		this.goToReadingPosition();
	},

	fontSizeCallback: function() {
		this.setFontSize();
		this.goToReadingPosition();
	},

	fontFaceCallback: function() {
		this.setFontFace();
		this.goToReadingPosition();
	},

    beeLineCallback: function() {
		this.setBeeLine();
		this.goToReadingPosition();
	},
    
	goToHashFragment: function(hashFragmentId) {
		var frame = this.getFrame();
		frame.focus();
		frame.contentDocument.location.hash = hashFragmentId;
	},

	keepInCenter: function(elem) {
		var f = this.getFrame();
		var h = this.getFrameHeight();
		var top = Number(elem.style.top.replace('px', ''));
		var bottom = top + Number(elem.style.height.replace('px', ''));

		// continuous scrolling
		f.contentWindow.scrollTo(0, top - Math.round(0.25 * h));

		// pagey scrolling
		/*
		if (bottom - f.contentWindow.scrollY > h) {
			f.contentWindow.scrollTo(0, top);
		}
		*/
	},

	goToReadingPosition: function() {
		if (this.model.get("reading_position") != null) {
			var focEl = $(this.getBody()).find(this.model.get("reading_position"));
			if (focEl.length > 0) {
				this.trackScrolling = false;
				this.getFrame().contentWindow.scrollBy(0, focEl[0].getClientRects()[0].top);
				this.trackScrolling = true;
			}
		}
	},

	makeScrollHandler: function() {
		var that = this;
		return function(evt) {
			if (that.trackScrolling && !!that.model.get('track_position')) {
				var el = BookshareUtils.findTopElement(that, 0.3);
				that.model.set('reading_position', BookshareUtils.getSelectorForNearestElementWithId(el));
			}
		};
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
		this.model.off("change:beeline_theme", this.injectTheme);
		this.model.off("change:beeline_theme", this.beeLineCallback);

		// remove the scroll handler
		this.getFrame().contentWindow.onscroll = null;

		// call the super destructor
		Readium.Views.PaginationViewBase.prototype.destruct.call(this);
	}
});
