Readium.Views.InjectedReflowablePaginationView = Readium.Views.PaginationViewBase.extend({

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function(options) {
		// call the super ctor
		Readium.Views.PaginationViewBase.prototype.initialize.call(this, options);
		this.page_template = Handlebars.templates.injected_reflowing_template;

		// make sure we have proper vendor prefixed props for when we need them
		this.stashModernizrPrefixedProps();

		// if this book does right to left pagination we need to set the
		// offset on the right
		if(this.model.epub.get("page_prog_dir") === "rtl") {
			this.offset_dir = "right";
		}
		else {
			this.offset_dir = "left";
		}

		this.trackPosition = true;

		this.pages.on("change:current_page", this.pageChangeHandler, this);
		this.model.on("change:toc_visible", this.windowSizeChangeHandler, this);
		this.model.on("repagination_event", this.windowSizeChangeHandler, this);
		this.model.on("change:current_theme", this.injectTheme, this);
		this.model.on("change:two_up", this.setUpMode, this);
		this.model.on("change:two_up", this.windowSizeChangeHandler, this);
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

		// make everything invisible to prevent flicker
		this.setUpMode();
		this.$('#container').html( this.page_template(json) );

		this.$('#readium-flowing-content').on("load", function(e) {

			// Important: Firefox doesn't recognize e.srcElement, so this
			// needs to be checked for whenever it's required.
			if (!e.srcElement) e.srcElement = this;
			e.srcElement.contentDocument.documentElement.appendChild(xhtml.children[0].cloneNode(true));
			e.srcElement.contentDocument.documentElement.appendChild(xhtml.children[1].cloneNode(true));
            // Transfer dir and lang from incoming document to iframe html element
            if (xhtml.dir && ! /^\s*$/.test(xhtml.dir)) {
                e.srcElement.contentDocument.documentElement.setAttribute("dir", xhtml.dir);
            }
            var language = xhtml.attributes.getNamedItemNS("http://www.w3.org/XML/1998/namespace","lang");
            language = language ? language.value : null;
            if (language && ! /^\s*$/.test(language)) {
                e.srcElement.contentDocument.documentElement.setAttribute("xml:lang", language);
            }
			that.adjustIframeColumns();
			that.iframeLoadCallback(e);
			that.setFontSize();
			that.setFontFace();
			that.injectTheme();
			that.setBeeLine();
			that.setNumPages();
			that.disableFocusAutoscroll();

			if (hashFragmentId) {
				that.goToHashFragment(hashFragmentId);
			} else {

				if(goToLastPage) {
					that.pages.goToLastPage();
				} else if (that.model.get('reading_position') != null) {
					that.goToReadingPosition();
				} else {
					that.pages.goToPage(1);
					// NOTE: current model pre-sets the current_page value to
					// spine pos + 1, so for first spine item, the prior line
					// did not actually fire a current_page event to trigger
					// the pageChangeHandler. We force page display manually.
					// This is not necessary in vanilla Readium because the
					// local goToPage calls are inline with adjustIframeColumns,
					// which we have factored out in order to make sequence of
					// events/page changes/reading position updates more explicit
					that.goToPage(1); 
				}
			}
		});
	},

    findVisiblePageElements: function() {
        var elmsWithId = $(this.getBody()).find("[id]");
        var doc = $("#readium-flowing-content").contents()[0].documentElement;
        var doc_top = 0;
        var doc_left = 0;
        var doc_right = doc_left + $(doc).width();
        var doc_bottom = doc_top + $(doc).height();
        
        var visibleElms = this.filterElementsByPosition(elmsWithId, doc_top, doc_bottom, doc_left, doc_right);
            
        return visibleElms;
    },
    
    // returns all the elements in the set that are inside the box
    // separated this function from the one above in order to debug it
    filterElementsByPosition: function(elements, documentTop, documentBottom, documentLeft, documentRight) {
        var visibleElms = elements.filter(function(idx) {
            var elm_top = $(this).offset().top;
            var elm_left = $(this).offset().left;
            var elm_right = elm_left + $(this).width();
            var elm_bottom = elm_top + $(this).height();
            
            var is_ok_x = elm_left >= documentLeft && elm_right <= documentRight;
            var is_ok_y = elm_top >= documentTop && elm_bottom <= documentBottom;
            
            return is_ok_x && is_ok_y;
        });  
        return visibleElms;
    },
    
	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

	// Description: Sometimes these views hang around in memory before
	//   the GC's get them. we need to remove all of the handlers
	//   that were registered on the model
	destruct: function() {
		
		this.hideContent();
		this.pages.off("change:current_page", this.pageChangeHandler);
		this.model.off("change:toc_visible", this.windowSizeChangeHandler);
		this.model.off("repagination_event", this.windowSizeChangeHandler);
		this.model.off("change:current_theme", this.injectTheme);
		this.model.off("change:two_up", this.setUpMode);
		this.model.off("change:two_up", this.windowSizeChangeHandler);
		this.model.off("change:current_margin", this.marginCallback);
		this.model.off("change:beeline_theme", this.injectTheme);
		this.model.off("change:beeline_theme", this.beeLineCallback);
		// call the super destructor
		Readium.Views.PaginationViewBase.prototype.destruct.call(this);
	},

	// REFACTORING CANDIDATE: I think this is actually part of the public interface
	goToPage: function(page) {

		var offset = this.calcPageOffset(page).toString() + "px";
		$(this.getBody()).css(this.offset_dir, "-" + offset);
		this.showContent();
        
        // record position
		if (this.trackPosition && !!this.model.get('track_position')) {
			var el = BookshareUtils.findTopElement(this);
			if (el) {
				var selector = BookshareUtils.getSelectorForNearestElementWithId(BookshareUtils.findTopElement(this));
				this.model.set('reading_position', selector);
			}
		}
	},

	// Description: navigate to a url hash fragment by calculating the page of
	//   the corresponding elem and setting the page number on `this.model`
	//   as precondition the hash fragment should identify an element in the
	//   section rendered by this view
	goToHashFragment: function(hashFragmentId) {
		// this method is triggered in response to 
		var fragment = hashFragmentId;
		if(fragment) {
			var el = $("#" + fragment, this.getBody())[0];

			if(!el) {
				// couldn't find the el. just give up
                return;
			}

			// we get more precise results if we look at the first children
			while (el.children.length > 0) {
				el = el.children[0];
			}

			var page = this.getElemPageNumber(el);

			if (this.trackPosition && !!this.model.get("track_position")) {
				var selector = BookshareUtils.getSelectorForNearestElementWithId(el);
				this.model.set('reading_position', selector);
			}

            if (page > 0) {
            	this.trackPosition = false;
                this.pages.goToPage(page);
                this.goToPage(page);
            	this.trackPosition = true;
			}
		}
		// else false alarm no work to do
	},

	setFontSize: function() {
		var size = this.model.get("font_size") / 10;
		$(this.getBody()).css("font-size", size + "em");

		// the content size has changed so recalc the number of 
		// pages
		this.setNumPages();
	},

	setFontFace: function() {
		var face = this.model.get("font_face");
		this.$('#readium-flowing-content').contents().find("link#fontStyle").remove();
		if (face == 'OpenDyslexic') {
		  this.$('#readium-flowing-content').contents().find('head').append('<link id="fontStyle" rel="stylesheet" type="text/css" href="fonts/OpenDyslexic/OpenDyslexic.css"/>');
		}
		$(this.getBody()).css("font-family", face);
		// the content size has changed so recalc the number of 
		// pages
		this.setNumPages();
	},
    
    setBeeLine: function() {
        this.commonBeelineLogic(this.$('#readium-flowing-content').contents());
	},

	// Description: we are using experimental styles so we need to 
	//   use modernizr to generate prefixes
	stashModernizrPrefixedProps: function() {
		var cssIfy = function(str) {
			return str.replace(/([A-Z])/g, function(str,m1){ 
				return '-' + m1.toLowerCase(); 
			}).replace(/^ms-/,'-ms-');
		};

		// ask modernizr for the vendor prefixed version
		this.columAxis =  Modernizr.prefixed('columnAxis') || 'columnAxis';
		this.columGap =  Modernizr.prefixed('columnGap') || 'columnGap';
		this.columWidth =  Modernizr.prefixed('columnWidth') || 'columnWidth';

		// we are interested in the css prefixed version
		this.cssColumAxis =  cssIfy(this.columAxis);
		this.cssColumGap =  cssIfy(this.columGap);
		this.cssColumWidth =  cssIfy(this.columWidth);
	},

	getBodyColumnCss: function() {
		var css = {};
		css[this.cssColumAxis] = "horizontal";
		css[this.cssColumGap] = this.gap_width.toString() + "px";
		css[this.cssColumWidth] = this.page_width.toString() + "px";
		css["padding"] = "0px";
		css["margin"] = "0px";
		css["position"] = "absolute";
		css["width"] = this.page_width.toString() + "px";
		css["height"] = this.frame_height.toString() + "px";
		return css;
	},

	adjustIframeColumns: function() {
		var prop_dir = this.offset_dir;
		var $frame = this.$('#readium-flowing-content');

		this.setFrameSize();
		this.frame_width = parseInt($frame.width(), 10);
		this.frame_height = parseInt($frame.height(), 10);
		this.gap_width = Math.floor(this.frame_width / 7);
		if(this.model.get("two_up")) {
			this.page_width = Math.floor((this.frame_width - this.gap_width) / 2);
		}
		else {
			this.page_width = this.frame_width;
		}
		

		// it is important for us to make sure there is no padding or
		// margin on the <html> elem, or it will mess with our column code
		$(this.getBody()).css( this.getBodyColumnCss() );
		this.setNumPages();
	},

	// This is now part of the public interface
	// Description: helper method to get the a reference to the documentElement
	// of the document in this strategy's iFrame.
	// TODO: this is a bad name for this function
	getBody: function() {
		return this.$('#readium-flowing-content').contents()[0].documentElement;
	},

	getFrame: function() {
		return this.$('#readium-flowing-content')[0];
	},

	hideContent: function() {
		$("#flowing-wrapper").css("opacity", "0");
	},

	showContent: function() {
		$("#flowing-wrapper").css("opacity", "1");
	},

	calcPageOffset: function(page_num) {
		return (page_num - 1) * (this.page_width + this.gap_width);
	},

	// Rationale: on iOS frames are automatically expanded to fit the content dom
	// thus we cannot use relative size for the iframe and must set abs 
	// pixel size
	setFrameSize: function() {
		var width = this.getFrameWidth().toString() + "px";
		var height = this.getFrameHeight().toString() + "px";

		this.$('#readium-flowing-content').attr("width", width);
		this.$('#readium-flowing-content').attr("height", height);
		this.$('#readium-flowing-content').css("width", width);
		this.$('#readium-flowing-content').css("height", height);
	},

	getFrameWidth: function() {
		var width;
		var margin = this.model.get("current_margin");
		if (margin === 1) {
			this.model.get("two_up") ? (width = 0.95) : (width = 0.90);
		}
		else if (margin === 2) {
			this.model.get("two_up") ? (width = 0.89) : (width = 0.80);
		}
		else if (margin === 3) {
			this.model.get("two_up") ? (width = 0.83) : (width = 0.70);	
		}
		else if (margin === 4) {
			this.model.get("two_up") ? (width = 0.77) : (width = 0.60);	
		}
		else {
			this.model.get("two_up") ? (width = 0.70) : (width = 0.50);	
		}
		
		return Math.floor( $('#flowing-wrapper').width() * width );
	},

	getFrameHeight: function() {
		return $('#flowing-wrapper').height();
	},

	// Description: calculate the number of pages in the current section,
	//   based on section length : page size ratio
	calcNumPages: function() {

		var body, offset, width, num;
		
		// get a reference to the dom body
		body = this.getBody();

		// Rationale: This is a hack that exists to support IE 10. For some 
		//   reason (that does not generate an error elsewhere), trying to get the content of the iframe with 
		//   the getBody() call returns null. I'm not entirely sure how that's possible, given that when this 
		//   call is made, the iframe clearly has content that is fully loaded. This call also seems to return 
		//   the expected result in Chrome, Safari and Firefox, and on the subsequent call to this method (Readium
		//   calls this method more than once when paginating - the first call is a bit redundant, so it is sufficient
		//   for this method to function correctly the second time in IE, even though it appears to introduce a jerkiness
		//   in the settings modal animation.) 
		if (!body) {
			return this.pages.get("num_pages");
		}
		
		// cache the current offset 
		offset = body.style[this.offset_dir];

		// set the offset to 0 so that all overflow is part of
		// the scroll width
		body.style[this.offset_dir] = "0px";

		// grab the scrollwidth => total content width
		width = this.getBody().scrollWidth;

		// reset the offset to its original value
		body.style[this.offset_dir] = offset;

		// perform calculation and return result...
		num = Math.floor( (width + this.gap_width) / (this.gap_width + this.page_width) );

		// in two up mode, always set to an even number of pages
		if( num % 2 === 0 && this.model.get("two_up")) {
			//num += 1;
		}
		return num;
	},

    getElemPageNumber: function(elem) {
		
		var rects, shift;
		rects = elem.getClientRects();
		if(!rects || rects.length < 1) {
			// if there were no rects the elem had display none
			return -1;
		}

		shift = rects[0][this.offset_dir];
		
		// calculate to the center of the elem (the edge will cause off by one errors)
		shift += Math.abs(rects[0].left - rects[0].right);
		
		// `clientRects` are relative to the top left corner of the frame, but
		// for right to left we actually need to measure relative to right edge
		// of the frame
		if(this.offset_dir === "right") {
			// the right edge is exactly `this.page_width` pixels from the right 
			// edge
			shift = this.page_width - shift;
		}
		// less the amount we already shifted to get to cp
		shift -= parseInt(this.getBody().style[this.offset_dir] || 0, 10); 
		return Math.ceil( shift / (this.page_width + this.gap_width) );
	},

	// REFACTORING CANDIDATE: This might be part of the public interface
	getElemPageNumberById: function(elemId) {
        var doc = $("#readium-flowing-content").contents()[0].documentElement;
        var elem = $(doc).find("#" + elemId);
        if (elem.length == 0) {
            return -1;
        }
        else {
            return this.getElemPageNumber(elem[0]);
        }
    },

	pageChangeHandler: function() {
        var that = this;

        // pfeh, ugly. If trackPosition is false, any changes to
        // current_page are for bookkeeping while trying to maintain
        // reading position.
        if (this.trackPosition) {
			this.hideContent();

			setTimeout(function() {
				that.goToPage(that.pages.get("current_page")[0]);
			}, 150);
		}
	},

	goToReadingPosition: function() {
		var page = this.pages.get("current_page")[0] || 1;

		var focEl = $(this.getBody()).find(this.model.get("reading_position"));
		if (focEl.length > 0) {
			var focElPage = this.getElemPageNumber(focEl[0]);
			if (! isNaN(focElPage) && focElPage > 0) {
				page = focElPage;
			}
		}

		this.trackPosition = false;
		// set model's page properly
		this.pages.goToPage(page);
		// manually go to page directly
		this.goToPage(page);
		this.trackPosition = true;
	},

	windowSizeChangeHandler: function() {
		this.adjustIframeColumns();
		this.goToReadingPosition();
	},
    
	marginCallback: function() {
		this.adjustIframeColumns();
		this.goToReadingPosition();
	},

	pageNumberCallback: function() {
		this.togglePageNumbers();
		this.adjustIframeColumns();
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

	setNumPages: function() {
		var num = this.calcNumPages();
		this.pages.set("num_pages", num);
	},
	
	disableFocusAutoscroll: function() {
	   var $html = $(this.getBody());
	   var $body = $html.find("body"); 
	   $body.find("a[href]").focus( function() {
	       $html.scrollLeft(0); // real fix for Firefox
	       setTimeout(function() { $body.scrollLeft(0); }, 0); // hack fix for Webkit
	   } );
	}
});
