Readium.Models.Toc = Backbone.Model.extend({

	sync: BBFileSystemSync,

	initialize: function(options) {
		this.file_path = options.file_path;
		this.book = options.book;
		this.book.on("change:toolbar_visible", this.setTocVis, this);
		this.book.on("change:reading_position", this.updateTocHighlight, this);
	},

	handleLink: function(href) {
		this.book.goToHref(href);
	},

	// stub for base class
	findNearestTocItemSelector: function(element) {
		return null;
	},

	updateTocHighlight: function() {
		var vis = !!this.book.get("toc_visible");
		if (vis) {
			var rp = this.book.get("reading_position");
			var contentBody = this.book.v.$el;
			var el = contentBody.find(rp);
			if (el.length > 0) {
				this.set('toc_highlight_selector', this.findNearestTocItemSelector(el[0]));
			}
		}
	},

	defaults: {
		visible: false
	}

}, {
	// Class Level Attributes!
	XHTML_MIME: "application/xhtml+xml",
	XML_MIME: "text/xml",	
	NCX_MIME: "application/x-dtbncx+xml",
	getToc: function(manItem, options) {
		var media_type = manItem.get("media_type");
		if(media_type === Readium.Models.Toc.XHTML_MIME || 
				media_type === Readium.Models.Toc.XML_MIME) {
			return new Readium.Models.XhtmlToc(options);
		}
		else if (media_type ===  Readium.Models.Toc.NCX_MIME) {
			return new Readium.Models.NcxToc(options);
		}
	}
});


Readium.Models.NcxToc = Readium.Models.Toc.extend({

	jath_template: {

		title: "//ncx:docTitle/ncx:text",

		navs: [ "//ncx:navMap/ncx:navPoint", { 
			text: "ncx:navLabel/ncx:text",
			href: "ncx:content/@src"
		} ]
	},

	parse: function(xmlDom) {
		var json;
		if(typeof(xmlDom) === "string" ) {
			var parser = new window.DOMParser;
      		xmlDom = parser.parseFromString(xmlDom, 'text/xml');
		}
		
		Jath.resolver = function(prefix) {
			if(prefix === "ncx") {
				return "http://www.daisy.org/z3986/2005/ncx/";	
			}
			return "";
		}

		json = Jath.parse( this.jath_template, xmlDom);
		return json;
	},

	TocView: function() {
		return new Readium.Views.NcxTocView({model: this});
	}

});

Readium.Models.XhtmlToc = Readium.Models.Toc.extend({

	parse: function(xmlDom) {
		var json = {};
		if(typeof(xmlDom) === "string" ) {
			var parser = new window.DOMParser;
      		xmlDom = parser.parseFromString(xmlDom, 'text/xml');
		}
		json.title = $('title', xmlDom).text();
		json.body = $('body', xmlDom);

		// save the IDs for quick lookups later
		json.toc_ids = [];
		$(json.body).find("nav[epub\\:type='toc'] a[href*='#']").each(
			function(idx, e) {
				json.toc_ids.push(e.getAttribute("href").split("#")[1]);
			}
		);

		return json;
	},

	findNearestTocItemSelector: function(element) {
		var result = null;
		if (element != null) {
			var elId = element.getAttribute("id");
			if (this.get("toc_ids").indexOf(elId) > -1) {
				result = "a[href$='#" + elId + "']";
			} else {
				if (element.previousElementSibling != null) {
					result = this.findNearestTocItemSelector(element.previousElementSibling);
				} else if (element.parentElement != null) {
					result = this.findNearestTocItemSelector(element.parentElement);
				}
			}
		}
		return result;
	},

	TocView: function() {
		return new Readium.Views.XhtmlTocView({model: this});
	}
});