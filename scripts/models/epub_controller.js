// Description: This model is a sort of "controller" for an ePUB, managing the interaction between calling code
//   and the saved epub. This model also exposes and persists properties that determine how an epub is displayed in 
//   Readium. Some of these properties are determined by the user, such as whether two pages are being displayed, the font size etc.
//   Other properties are determined by the user's interaction with the reader and the structure of the book. These include
//   the current spine item rendered in the viewer, as well the logic that governs changing the current spine item.  
//
// Rationale: This model is designed to expose a useful concept of an "epub" to the rest of Readium. This includes the contents
//   of the epub itself, as well as view properties (mentioned above) and the logic governing interaction with epub properties and 
//   contents. It is the intention for this model that it have little to no knowledge of how an epub is rendered. It is intended 
//   that Backbone attributes (getting/setting) and the backbone attribute event model (events fired on attribute changes) should 
//   the primary ways of interacting with this model.

Readium.Models.EPUBController = Backbone.Model.extend({

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function() {

		// capture context for use in callback functions
		var that = this;

		this.epub = this.get("epub");

		// Load options from local storage
		this.options = Readium.Models.ReadiumOptions.getInstance();

		// use modernizr to detect css column support
		this.set("columns_supported", Modernizr.testProp(Modernizr.prefixed('columnWidth')));
		if (!this.get("columns_supported")) {
			this.options.set("pagination_mode", "scrolling");
		}

		// apply options
		this.options.set("controller", this);
		this.options.applyOptions();

		// create a [`Paginator`](/docs/paginator.html) object used to initialize
		// pagination strategies for the spine items of this book
		this.paginator = new Readium.Models.PaginationStrategySelector({book: this});

		// Get the epub package document
		this.packageDocument = this.epub.getPackageDocument();

		// TODO: this might have to change: Should this model load the package document or epub_state??
		// load the `packageDocument` from the HTML5 filesystem asynchroniously
		this.packageDocument.fetch({

			// success callback is executed once the filesSystem contents have 
			// been read and parsed
			success: function() {

				// restore the position the reader left off at from cookie storage
				var pos = that.restorePosition();
				that.set("spine_position", pos);
				that.set("reading_position", that.loadReadingPosition());

				// tell the paginator to start rendering spine items from the 
				// freshly restored position
				var items = that.paginator.renderSpineItems(false);
				that.set("rendered_spine_items", items);
				
				// check if a TOC is specified in the `packageDocument`
				that.set("has_toc", ( !!that.packageDocument.getTocItem() ) );
			}
		});
        
        // `change:spine_position` is triggered whenver the reader turns pages
		// accross a `spine_item` boundary. We need to cache thier new position
		// and 
		this.on("change:spine_position", this.savePosition, this);
		this.on("change:spine_position", this.clearReadingPosition, this);

		// If we encounter a new fixed layout section, we need to parse the 
		// `<meta name="viewport">` to determine the size of the iframe
		this.on("change:spine_position", this.setMetaSize, this);

		// save reading position
		this.on("change:reading_position", this.saveReadingPosition, this);

		if (window.hasOwnProperty('BeneSpeak')) {
			this.ttsPlayer = new Readium.Models.TTSPlayer({controller: this});
		}
	},

	defaults: {
    	"font_size": 10,
    	"display_page_numbers": true,
    	"should_scroll": false,
    	"two_up": false,
    	"full_screen": false,
    	"toolbar_visible": true,
    	"toc_visible": false,
    	"rendered_spine_items": [],
    	"current_theme": "default-theme",
    	"current_margin": 3,
    	"track_position": true,
    	"reading_position": null
  	},

	toggleFullScreen: function() {
		var fullScreen = this.get("full_screen");
		this.set({full_screen: !fullScreen});
	},

	increaseFont: function() {
		var size = this.get("font_size");
		this.set({font_size: size + 1})
	},

	decreaseFont: function() {
		var size = this.get("font_size");
		this.set({font_size: size - 1})
	},

	toggleToc: function() {
		var vis = this.get("toc_visible");
		this.set("toc_visible", !vis);
	},

	// Description: Obtains the href and hash (if it exists) to set as the current "position"
	//    of the epub. Any views and models listening to epub attributes are informed through
	//    the backbone event broadcast.
	// Arguments (
	//   href (URL): The url and hash fragment that indicates the position in the epub to set as
	//   the epub's current position.
	// )
	goToHref: function(href) {
		// URL's with hash fragments require special treatment, so
		// first thing is to split off the hash frag from the rest
		// of the url:
		var splitUrl = BookshareUtils.getSplitUrl(href);

		// handle the base url first:
		if(splitUrl[1]) {
			var spine_pos = this.packageDocument.spineIndexFromHref(splitUrl[1]);
			var goToId = splitUrl[2];
			this.setSpinePos(spine_pos, false, goToId);
		}

	},

	getToc: function() {
		var item = this.packageDocument.getTocItem();
		if(!item) {
			return null;
		}
		else {
			var that = this;
			return Readium.Models.Toc.getToc(item, {
				file_path: that.resolvePath(item.get("href")),
				book: that
			});
		}
	},

	// Info: "Section" actually refers to a spine item
	getCurrentSection: function(offset) {
		if(!offset) {
			offset = 0;
		}
		var spine_pos = this.get("spine_position") + offset;
		return this.packageDocument.getSpineItem(spine_pos);
	},

	// REFACTORING CANDIDATE: this should be renamed to indicate it applies to the entire epub.
	//   This is only passing through this data to avoid breaking code in viewer.js. Eventually
	//   this should probably be removed. 
	isFixedLayout: function() {
		return this.epub.isFixedLayout();
	},

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

	restorePosition: function() {
		var pos = Readium.Utils.getCookie(this.epub.get("key"));
		return parseInt(pos, 10) || this.packageDocument.getNextLinearSpinePostition();
	},

	savePosition: function() {
		Readium.Utils.setCookie(this.epub.get("key"), this.get("spine_position"), 365);
	},

	loadReadingPosition: function() {
		return Readium.Utils.getCookie(this.epub.get("key") + "_rp");
	},

	saveReadingPosition: function() {
		if (this.get("reading_position") != null) {
			Readium.Utils.setCookie(this.epub.get("key") + "_rp", this.get("reading_position"), 365);
		}
	},

	// should clear reading position when traversing spine items, since
	// selectors are only valid within a given XHTML file
	clearReadingPosition: function() {
		this.set('reading_position', null);
	},

	resolvePath: function(path) {
		return this.packageDocument.resolvePath(path);
	},

	hasNextSection: function() {
		var start = this.get("spine_position");
		return this.packageDocument.getPrevLinearSpinePostition(start) > -1;
	},

	hasPrevSection: function() {
		var start = this.get("spine_position");
		return this.packageDocument.getNextLinearSpinePostition(start) > -1;
	},
	
	// goes the next linear section in the spine. Non-linear sections should be
	// skipped as per [the spec](http://idpf.org/epub/30/spec/epub30-publications.html#sec-itemref-elem)
	goToNextSection: function() {

		var cp = this.get("spine_position");
		var pos = this.packageDocument.getNextLinearSpinePostition(cp);
		if(pos > -1) {
			this.setSpinePos(pos, false);	
		} else {
			alert("You have reached the end of this book.");
		}
		
	},
	
	// goes the previous linear section in the spine. Non-linear sections should be
	// skipped as per [the spec](http://idpf.org/epub/30/spec/epub30-publications.html#sec-itemref-elem)
	goToPrevSection: function() {
		var cp = this.get("spine_position");
		var pos = this.packageDocument.getPrevLinearSpinePostition(cp);
		if(pos > -1) {
			this.setSpinePos(pos, true);	
		} else {
			alert("You are at the beginning of this book.");
		}
	},

	setSpinePos: function(pos, goToLastPageOfSection, goToHashFragmentId) {
		// check for invalid spine position
		if (pos < 0 || pos >= this.packageDocument.spineLength()) {
			return;
		}

		var spineItems = this.get("rendered_spine_items");
		var spinePosIsRendered = spineItems.indexOf(pos) >=0 ? true : false;

		// REFACTORING CANDIDATE: There is a somewhat hidden dependency here between the paginator
		//   and the setting of the spine_position. The pagination strategy selector re-renders based on the currently
		//   set spine_position on this model. The pagination strategy selector has a reference to this model, which is 
		//   how it accesses the new spine_position, through the "getCurrentSection" method. 
		//   This would be clearer if the spine_position to set were passed explicitly to the paginator. 
		this.set("spine_position", pos);

		// REFACTORING CANDIDATE: This event should only be triggered for fixed layout sections
		this.trigger("FXL_goToPage");

		// Render the new spine position if it is not already rendered.
		if (!spinePosIsRendered) {
			var renderedItems = this.paginator.renderSpineItems(goToLastPageOfSection, goToHashFragmentId);
			this.set("rendered_spine_items", renderedItems);
		} else {
			if (!this.isFixedLayout() && goToHashFragmentId) {
				this.paginator.v.goToHashFragment(goToHashFragmentId);
			}
		}
	},

	setMetaSize: function() {

		if(this.meta_section) {
			this.meta_section.off("change:meta_height", this.setMetaSize);
		}
		this.meta_section = this.getCurrentSection();
		if(this.meta_section.get("meta_height")) {
			this.set("meta_size", {
				width: this.meta_section.get("meta_width"),
				height: this.meta_section.get("meta_height")
			});
		}
		this.meta_section.on("change:meta_height", this.setMetaSize, this);
	}
});

//Keep manifest up-to-date. 
setInterval(function() { 
	window._epub.packageDocument.fetch({success: function() {}}); 
}, 1800000);

