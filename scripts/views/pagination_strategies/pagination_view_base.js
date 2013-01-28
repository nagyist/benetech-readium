// Description: The base model for the set of different pagination view strategies: Reflowable, fixed layout and scrolling
// Rationale: The intention behind this model is to provide implementations for behaviour common to all the pagination 
//   strategies. 
// Notes: This model has a reference to the model for the epub currently being rendered, as well as a "pages" object that
//   contains data and behaviour related to the current set of rendered "pages."

Readium.Views.PaginationViewBase = Backbone.View.extend({

	// Description: All strategies are linked to the same dom element
	el: "#readium-book-view-el",

	/* ------------------------------------------------------------------------------------ */
	//  "PUBLIC" METHODS (THE API)                                                          //
	/* ------------------------------------------------------------------------------------ */

	initialize: function(options) {
		this.zoomer = options.zoomer;
		this.pages = new Readium.Models.ReadiumPagination({model : this.model});

		this.pages.on("change:current_page", this.showCurrentPages, this);
		this.model.on("change:display_page_numbers", this.pageNumberCallback, this);
		this.model.on("change:font_size", this.fontSizeCallback, this);
        
		this.bindingTemplate = Handlebars.templates.binding_template;
		this.shortcutTemplate = Handlebars.templates.iframe_keyboard_shortcuts;
	},

    iframeLoadCallback: function(e) {
		
		this.applyBindings( $(e.srcElement).contents() );
		this.applySwitches( $(e.srcElement).contents() );
		this.addSwipeHandlers( $(e.srcElement).contents() );
        this.injectHighlightStyles(e.srcElement);
        this.injectPageNumberStyles(e.srcElement);
        this.togglePageNumbers();
        this.injectLinkHandler(e.srcElement);
        this.injectKeyboardSupport(e.srcElement);
        var trigs = this.parseTriggers(e.srcElement.contentDocument);
		this.applyTriggers(e.srcElement.contentDocument, trigs);
	},
	
    // Description: Activates a style set for the ePub, based on the currently selected theme. At present, 
    //   only the day-night alternate tags are available as an option. 
	activateEPubStyle: function(bookDom) {

	    var selector;
		
		// Apply night theme for the book; nothing will be applied if the ePub's style sheets do not contain a style
		// set with the 'night' tag
	    if (this.model.get("current_theme") === "night-theme") {

	    	selector = new Readium.Models.AlternateStyleTagSelector;
	    	bookDom = selector.activateAlternateStyleSet(["night"], bookDom);

	    }
	    else {

			selector = new Readium.Models.AlternateStyleTagSelector;
	    	bookDom = selector.activateAlternateStyleSet([""], bookDom);
	    }
	},

	// REFACTORING CANDIDATE: This method could use a better name. The purpose of this method is to make one or two 
	//   pages of an epub visible. "setUpMode" seems non-specific. 
	// Description: Changes the html to make either 1 or 2 pages visible in their iframes
	setUpMode: function() {
		var two_up = this.model.get("two_up");
		this.$el.toggleClass("two-up", two_up);
		this.$('#spine-divider').toggle(two_up);
	},

	// Description: Iterates through the list of rendered pages and displays those that 
	//   should be visible in the viewer.
	showCurrentPages: function() {
		var that = this;
		var two_up = this.model.get("two_up");
		this.$(".page-wrap").each(function(index) {
			if(!two_up) { 
				index += 1;
			}
			$(this).toggleClass("hidden-page", !that.pages.isPageVisible(index));
		});
	},

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

	// Description: Sometimes views hang around in memory before
	//   the GC gets them. we need to remove all of the handlers
	//   that were registered on the model
	destruct: function() {
		this.pages.off("change:current_page", this.showCurrentPages);
		this.model.off("change:display_page_numbers", this.pageNumberCallback, this);
		this.model.off("change:font_size", this.fontSizeCallback);
		this.resetEl();
	},

	// Description: Handles clicks of anchor tags by navigating to
	// the proper location in the epub spine, or opening
	// a new window for external links
	linkClickHandler: function(e) {
		e.preventDefault();
		
		var href = $(e.currentTarget).attr("href");
		if(href.match(/^http(s)?:/)) {
			window.open(href);
		} else {
			this.model.goToHref(href);
			var splitUrl = BookshareUtils.getSplitUrl(href);

			// handle the base url first:
			if(splitUrl[1]) {
				BookshareUtils.setFocus(splitUrl[2]);
			}
		}
	},
	
	getBindings: function() {
		var packDoc = this.model.epub.getPackageDocument();
		var bindings = packDoc.get('bindings');
		return bindings.map(function(binding) {
			binding.selector = 'object[type="' + binding.media_type + '"]';
			binding.url = packDoc.getManifestItemById(binding.handler).get('href');
			binding.url = packDoc.resolveUri(binding.url);
			return binding;
		})
	},

	applyBindings: function(dom) {
		var that = this;
		var bindings = this.getBindings();
		var i = 0;
		for(var i = 0; i < bindings.length; i++) {
			$(bindings[i].selector, dom).each(function() {
				var params = [];
				var $el = $(this);
				var data = $el.attr('data');
				var url;
				params.push("src=" + that.model.packageDocument.resolveUri(data));
				params.push('type=' + bindings[i].media_type);
				url = bindings[i].url + "?" + params.join('&');
				var content = $(that.bindingTemplate({}));
				// must set src attr separately
				content.attr('src', url);
				$el.html(content);
			});
		}
	},

	applyTriggers: function(dom, triggers) {
		for(var i = 0 ; i < triggers.length; i++) {
			triggers[i].subscribe(dom);
		}
	},

	// Description: For reflowable content we only add what is in the body tag.
	// Lots of times the triggers are in the head of the dom
	parseTriggers: function(dom) {
		var triggers = [];
		$('trigger', dom).each(function() {
			

			triggers.push(new Readium.Models.Trigger(this) );
		});
		
		return triggers;
	},	

	// Description: Parse the epub "switch" tags and hide
	// cases that are not supported
	applySwitches: function(dom) {

		// helper method, returns true if a given case node
		// is supported, false otherwise
		var isSupported = function(caseNode) {

			var ns = caseNode.attributes["required-namespace"];
			if(!ns) {
				// the namespace was not specified, that should
				// never happen, we don't support it then
				console.log("Encountered a case statement with no required-namespace");
				return false;
			}
			// all the xmlns's that readium is known to support
			// TODO this is going to require maintanence
			var supportedNamespaces = ["http://www.w3.org/1998/Math/MathML"];
			return _.include(supportedNamespaces, ns);
		};

		$('switch', dom).each(function(ind) {
			
			// keep track of whether or now we found one
			var found = false;

			$('case', this).each(function() {

				if( !found && isSupported(this) ) {
					found = true; // we found the node, don't remove it
				}
				else {
					$(this).remove(); // remove the node from the dom
				}
			});

			if(found) {
				// if we found a supported case, remove the default
				$('default', this).remove();
			}
		})
	},

	addSwipeHandlers: function(dom) {
		var that = this;
		$(dom).on("swipeleft", function(e) {
			e.preventDefault();
			that.pages.goRight();
			
		});

		$(dom).on("swiperight", function(e) {
			e.preventDefault();
			that.pages.goLeft();
		});
	},

	togglePageNumbers: function () {
		var that = this;
		$(this.getBody()).find(".bksPageNumber").each(
			function(idx, el) {
				if (that.model.get("display_page_numbers")) {
					el.textContent = el.getAttribute("title");
					$(el).addClass("bksPageNumberOn");
				} else {
					while (el.hasChildNodes()) {
						el.removeChild(el.childNodes[0]);
					}
					$(el).removeClass("bksPageNumberOn");
				}
			}
		);
	},

	highlightThemes: {
		"default": ".ttsImgHL { background-color: #3366AA; opacity: 0.5; z-index: 4242;}\n.ttsSentHL { background-color: #DDDDDD; z-index: -2; }\n.ttsWordHL { background-color: #99CCFF; z-index: -1;}",
		"night": ".ttsImgHL { background-color: #3366AA; opacity: 0.5; z-index: 4242;}\n.ttsSentHL { background-color: #B0C6F5; z-index: -2; }\n.ttsWordHL { background-color: #F37D01; z-index: -1;}"
	},
	
	// inject styles into iframe
    injectHighlightStyles: function (iframe) {
    	var doc, head, style;
		doc = iframe.contentDocument;
		head = doc.getElementsByTagName("head")[0];
		if(head) {
			//Remove any previous ones.
			var previousHighlightStyles = $(head).find("#highlightStyle");
			if (previousHighlightStyles.length > 0) {
				$(previousHighlightStyles.remove());
			}
		    style = doc.createElement("style");
			$(style).attr("id", "highlightStyle");
			style.type = "text/css";
			var theme = this.model.get("current_theme");
			style.innerHTML = theme == "night-theme" ? this.highlightThemes["night"] : this.highlightThemes["default"];
			head.appendChild(style);
		}
    },
    
	// inject styles into iframe
    injectPageNumberStyles: function (iframe) {
    	var doc, head, style;
		doc = iframe.contentDocument;
		head = doc.getElementsByTagName("head")[0];
		
		if(head) {
		    style = doc.createElement("style");
			style.type = "text/css";
			style.innerHTML = ".bksPageNumberOn { display:block; text-align: center; width: 25%; margin-left: auto; margin-right: auto; font-weight: bold; font-style: italic; border: 1px solid gray; }";
			head.appendChild(style);
		}
    },

    injectLinkHandler: function(iframe) {
    	var that = this;
    	$('a', iframe.contentDocument).click(function(e) {
    		that.linkClickHandler(e)
    	});
    },

    injectKeyboardSupport: function(iframe) {
    	var that = this;
    	// inject keyboard shortcuts and access keys

    	// this duplicates code in viewer.js, under addGlobalEventHandlers,
    	// but this view doesn't know about that one, and that view ends up
    	// delegating to the paginator view, which this file defines. Lose-lose.
		$(iframe.contentDocument).keydown(function(e) {
			if(e.which == 39) {
				that.model.paginator.v.pages.goRight();
			}
							
			if(e.which == 37) {
				that.model.paginator.v.pages.goLeft();
			}
		});

		var body = $(that.getBody()).find("body");
		body.append($(that.shortcutTemplate({ ttsEnabled : (window.chrome && window.chrome.extension)})));
		body.find("#hiddenAccessKeys a[accesskey]").bind("click",
			function(e) {
				e.preventDefault();
				var link = $(window.document.body).find("a[accesskey='" + e.currentTarget.getAttribute("accesskey") + "']");
				if (link.attr("href").search("#") == 0) {
					link.click();
				} else {
					window.document.location = link.attr("href");
				}
			}
		);
    },

	injectTheme: function(iframe) {
		var theme = this.model.get("current_theme");
		if(theme === "default") theme = "default-theme";
		$(this.getBody()).css({
			"color": this.themes[theme]["color"],
			"background-color": this.themes[theme]["background-color"]
		});
		
		// stop flicker due to application for alternate style sheets
		// just set content to be invisible
		$("#flowing-wrapper").css("visibility", "hidden");
		this.activateEPubStyle(this.getBody());
		
		//Update highlight colors.
		this.injectHighlightStyles(this.getFrame());

		// wait for new stylesheets to parse before setting back to visible
		setTimeout(function() {
			$("#flowing-wrapper").css("visibility", "visible");	
		}, 100);
	},
	
	themes: {
		"default-theme": {
			"background-color": "white",
			"color": "black",
			"mo-color": "#777"
		},

		"vancouver-theme": {
			"background-color": "#DDD",
			"color": "#576b96",
			"mo-color": "#777"
		},

		"ballard-theme": {
			"background-color": "#576b96",
			"color": "#DDD",
			"mo-color": "#888"
		},

		"parchment-theme": {
			"background-color": "#f7f1cf",
			"color": "#774c27",
			"mo-color": "#eebb22"
		},

		"night-theme": {
			"background-color": "#141414",
			"color": "white",
			"mo-color": "#666"
		}
	},

    resetEl: function() {
    	$('body').removeClass("apple-fixed-layout");
    	$("#readium-book-view-el").attr("style", "");
		this.$el.toggleClass("two-up", false);
		this.$('#spine-divider').toggle(false);
		this.zoomer.reset();

    	$('#page-wrap').css({
    		"position": "relative",
    		"right": "0px", 
    		"top": "0px",
    		"-webkit-transform": "scale(1.0) translate(0px, 0px)"
    	});
    }
});