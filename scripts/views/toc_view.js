Readium.Views.TocViewBase = Backbone.View.extend({

	el: "#readium-toc",

	initialize: function() {
		this.model.on("change", this.render, this);
		this.model.on("change:visible", this.setVisibility, this);
	},

	events: {
		"click a": "handleClick",
		"click #close-toc-button": "closeToc",
		"keyup #close-toc-button": "closeToc"
	},

	setVisibility: function() {
		this.$el.toggle(this.model.get("visible"));
	},

	handleClick: function(e) {
		e.preventDefault();
		href = $(e.currentTarget).attr("href");
		this.model.handleLink(href);
		var splitUrl = BookshareUtils.getSplitUrl(href);

		// handle the base url first:
		if(splitUrl[1]) {
			this.setFocus(splitUrl[2]);
		}
	},

	handlePageSelect : function (e) {
	    var option = e.target[e.target.selectedIndex];
        var href = option.value;
        // store selected option so it can be "selected" when TOC is re-rendered
        this.model.set("selected_page_number", option.text)
        this.model.handleLink(href);
        var splitUrl = BookshareUtils.getSplitUrl(href);

        // handle the base url first:
        if(splitUrl[1]) {
            this.setFocus(splitUrl[2]);
        }
	},

	closeToc: function(e) {
		if (e.type == "click" || (e.type == "keyup" && e.keyCode == 13)) {
			e.preventDefault();
			this.model.hide();
		}
	}, 

	setFocus: function(goToId) {
		var contentsFrame = $(window._epubController.paginator.v.getFrame());
		contentsFrame.focus();
		var elementToFocusOn = contentsFrame.contents().find("#"+goToId);
		if ($(elementToFocusOn).length > 0) {
			setTimeout(function() {
				elementToFocusOn.attr('tabindex', '-1').focus();
			}, 500);
		}
	},

	scrollToNavItem: function(el) {
		var yPos = el.getClientRects()[0].top;
		var tocBody = this.$('#toc-body');
		var top = yPos + this.$('#toc-header').height();
		tocBody.scrollTop(tocBody.scrollTop() + top - Math.ceil(tocBody.height() * 0.4));
	}

});


Readium.Views.NcxTocView = Readium.Views.TocViewBase.extend({ 

	initialize: function() {
		Readium.Views.TocViewBase.prototype.initialize.call(this);
		this.nav_template = Handlebars.templates.ncx_nav_template;
	},

	render: function() {
		this.setVisibility();
		var ol = $("<ol></ol>");
		var navs = this.model.get("navs");
		for(var i = 0; i < navs.length; i++) {
			ol.append( this.nav_template(navs[i]) );
		}
		this.$('#toc-body').html("<h1 tabindex='-1' id='toc-heading-ref'>" + (this.model.get("title") || "Table of Contents") + "</h1>");
		this.$('#toc-body').append(ol);
		this.$('#toc-body').append("<div id='toc-end-spacer'>");
		return this;
	}

});

Readium.Views.XhtmlTocView = Readium.Views.TocViewBase.extend({ 

	events: {
		"click a": "handleClick",
		"click #close-toc-button": "closeToc",
		"keyup #close-toc-button": "closeToc",
		"change #toc-page-select": "handlePageSelect"
	},

	render: function() {
        this.$('#toc-body').html("<label for='toc-page-select'>Go to page:</label> <select id='toc-page-select'></select>");
		this.$('#toc-body').append( this.model.get("body").html() );
		this.formatPageListNavigation();
		this.$('#toc-body').append("<div id='toc-end-spacer'>");
		if (this.model.get("visible")) {
			this.renderTocHighlight();
		}
		return this;
	},

	renderTocHighlight: function() {
		var selector = this.model.get("toc_highlight_selector");
		if (selector) {
			var targetLink = this.$('#toc-body').find(selector).addClass("tocHighlight");
			this.scrollToNavItem(targetLink[0]);
		}
	},

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

	formatPageListNavigation: function () {

		var $navElements;
		var $pageListNavElement;
		var $pageSelect;
		var selectedPage;

		// Search for a nav element with epub:type="page-list". A nav element of this type must not occur more than once.
		$navElements = this.$("nav");
		$pageListNavElement = $navElements.filter(function () {

			if ($(this).attr("epub:type") === 'page-list') {

				// Hide the standard XHTML page-list nav element in favor of #toc-page-select
				$(this).attr("id", "page-list-select");
				$(this).hide();
				return true;
			}
		});

		// Each nav element has a single ordered list of page numbers. Extract this data into an array so it can be 
		//   loaded in the page-list control
		// TODO: span elements can be used to create sub-headings. Implement functionality to account for this at some point.
		$pageSelect = this.$("#toc-page-select");
		selectedPage = this.model.get("selected_page_number")
		$.each($('a', $pageListNavElement), function () { 
			var $navTarget = $(this);
			$pageSelect.append($('<option/>', {
                value: $navTarget.attr('href'),
                text: $navTarget.text(),
                selected: $navTarget.text() == selectedPage
                }));
		});

	}
});