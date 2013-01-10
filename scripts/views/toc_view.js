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
			BookshareUtils.setFocus(splitUrl[2]);
		}
	},

	handleSelect : function (e) {
		var href = e.val;
		this.model.handleLink(href);
		var splitUrl = BookshareUtils.getSplitUrl(href);

		// handle the base url first:
		if(splitUrl[1]) {
			BookshareUtils.setFocus(splitUrl[2]);
		}
	},

	closeToc: function(e) {
		if (e.type == "click" || (e.type == "keyup" && e.keyCode == 13)) {
			e.preventDefault();
			this.model.hide();
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
		"change #page-list-select": "handleSelect"
	},

	render: function() {
		this.$('#toc-body').html( this.model.get("body").html() );
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
		var pageListData = [];

		// Search for a nav element with epub:type="page-list". A nav element of this type must not occur more than once.
		$navElements = this.$("nav");
		$pageListNavElement = $navElements.filter(function () {

			if ($(this).attr("epub:type") === 'page-list') {

				// Hide the standard XHTML page-list nav element, as we'll be displaying a select2 drop-down control for this.
				$(this).attr("id", "page-list-select");
				$(this).hide();
				return true;
			}
		});

		// Each nav element has a single ordered list of page numbers. Extract this data into an array so it can be 
		//   loaded in the page-list control
		// TODO: span elements can be used to create sub-headings. Implement functionality to account for this at some point.
		$.each($('a', $pageListNavElement), function () { 

			var $navTarget = $(this);
			pageListData.push({

				id : $navTarget.attr("href"),
				text : "Page " + $navTarget.text()
			});
		});

		// Create the select2 control
		$("#page-list-select").select2({

			placeholder : "Select a page",
			data : pageListData
		});

		// the select2 adds no-op inline click handlers, but these are not allowed
		// by chromes content securty policy so just remove them
		this.$('[onclick]').removeAttr('onclick');
	}
});