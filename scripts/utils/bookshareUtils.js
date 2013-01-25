window.BookshareUtils = {

	environment: 'LIVE',

	ie9Flag: null,

	POSITION_TRACKING_EXCLUSIONS: ['html', 'section', 'div'],

	AWS_URL_PATTERN: /https\:\/\/(?:(qa|staging)\-){0,1}bookshare\-reader\.s3\.amazonaws\.com\/viewer\.html\?book=(\d*)/,

	flatten: function(s) {
		if (this.environment == 'DEV') {
		  return s.substr(s.lastIndexOf('/'));
		}
        return s.replace(/\//g, "%2F");
	},

	makeSyncFunction: function(urlFunction, dataType, useJSONP) {

		return function(method, model, options) {
			var syncUrl = urlFunction(model);

			if(!syncUrl) {
				throw "Cannot sync the model without a valid sync URL.";
			}

			switch (method) {
		        case "read":
		        	var ajaxParams = {
		        		url: syncUrl,
		        		dataType: dataType,
						xhrFields: {
							withCredentials: true
						},
		        		crossDomain: true,
		        		success: function(data, textStatus, jqXHR) { options.success(data); },
		        		error: function(jqXHR, textStatus, errorThrown) { options.error(jqXHR); }
		        	};

					if (useJSONP) {
						ajaxParams.cache = true;
						ajaxParams.dataType = "jsonp " + dataType;
					}

		        	$.ajax(ajaxParams);
		            break;
		        case "create":
		            throw "Not yet implemented";
		            break;
		        case "update":
		            throw "Not yet implemented";
		            break;
		        case "delete":
		            throw "Not yet implemented";
		            break;
		    }

		    return null;
		}
	},

	resolveUrl: function(u) {
		var normalized;
		if (u.substring(0,3) == "../") {
			normalized = u.substring(3);
		} else {
			normalized = u;
		}

		normalized = BookshareUtils.flatten(normalized);

		var manifest = window._epub.packageDocument.get('manifest');
		var item = manifest.find(function(i) { var uu = new URI(i.get('href')); return (uu.path.indexOf(normalized) > -1);});
		if (item == null) {
			return null;
		} else {
			return item.get('href');
		}
	},

	setEnvironment: function(href) {
		BookshareUtils.http = 'https://';

		if (href.indexOf('http://reader.dev.bookshare.org:8080/viewer.html?book=') == 0) {
			BookshareUtils.environment = 'DEV'; 
			BookshareUtils.http = 'http://';
		} else {
			var match;
			if (window.chrome && window.chrome.extension) {
				match = /chrome\-extension\:\/\/\w*?\/views\/viewer\.html\?book=\d*?(?:&env=(\w*))/.exec(href);
			} else {
				match = BookshareUtils.AWS_URL_PATTERN.exec(href);
			}

			if (match != null) {
				if (match[1] == 'qa') { BookshareUtils.environment = 'QA'; }
				else if (match[1] == 'staging') { BookshareUtils.environment = 'STAGING'; }
			}
		}
	},

	resolveEnvironment: function(href) {
		var uri = new URI(href);

		if (uri.authority == 'www.bookshare.org') {
			if (BookshareUtils.environment == 'QA') {
				uri.authority = 'public.qa.bookshare.org';
			} else if (BookshareUtils.environment == 'STAGING') {
				uri.authority = 'public.staging.bookshare.org';
			} else if (BookshareUtils.environment == 'DEV') {
				uri.authority = 'public.dev.bookshare.org:8080';
			}
		}

		return uri.toString();
	},

	raiseSystemAlert: function(key, params) {
		var template = Handlebars.templates[key];
		$('#system-message-content').html(template((params != null) ? params : {}));
		this.raiseModal('#system-message');
	},

	dismissSystemAlert: function() {
		this.dismissModal('#system-message');
		$('#system-message-content').html('');
	},

	findTopElement: function(viewObject) {
		var contentDiv = viewObject.$el;

		if (viewObject.model.epub.get("page_prog_dir") == "rtl") {
			var plumbLine = (2 * contentDiv.width()) / 3;
		} else {
			var plumbLine = contentDiv.width() / 3;
		}

		var result = null;
		var height = contentDiv.height();
		var y = viewObject.getBoundingRect().top;

		result = document.elementFromPoint(plumbLine, y);
		while (y < height && result != null && this.POSITION_TRACKING_EXCLUSIONS.indexOf(result.tagName.toLowerCase()) > -1) {
			y = y + 10;
			result = document.elementFromPoint(plumbLine, y);
		}
		return result;
	},

	getSelectorForNearestElementWithId: function(element) {
		var result = null;
		if (element.getAttribute('id') != null) {
			result = element.tagName + '#' + element.getAttribute('id');
		} else {
			// check preceding siblings, then parent
			if (element.previousElementSibling != null) {
				result = this.getSelectorForNearestElementWithId(element.previousElementSibling);
			} else if (element.parentElement.id != 'readium-content' && this.POSITION_TRACKING_EXCLUSIONS.indexOf(element.parentElement.tagName.toLowerCase()) == -1) {
				result = this.getSelectorForNearestElementWithId(element.parentElement);
			}
		}
		return result;
	},

	getSplitUrl: function(href) {
		return href.match(/([^#]*)(?:#(.*))?/);
	},

	isIE9 : function() {

		if (this.ie9Flag == null) {
		    var undef;
		    var v = 3;
		    var div = document.createElement('div');
		    var all = div.getElementsByTagName('i');

		    while (
		        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
		        all[0]
		    );

		    if (v === 9) {
		    	this.ie9Flag = true;
		    }
		    else {
		    	this.ie9Flag = false;
		    }
		}

		return this.ie9Flag;
	},
	
	//Return a path relative to the root of the publication.
	getRelativePath: function(href) {
		var publicationRoot = window._epubController.get("publication_root");
		if (href.indexOf(publicationRoot) !== -1) {
			return href.replace(publicationRoot, "");
		}
	},

	raiseModal: function(selector, options) {
		// suspend tracking
		window._epubController.set("track_position", false);

		// create background div
		var backdrop = document.createElement("div");
		backdrop.id = "modal-backdrop";
		backdrop.style.display = "none";
		backdrop.className = "modal-backdrop";
		document.body.appendChild(backdrop);
		$(backdrop).fadeIn(50);

		// fade in the modal
		$(selector).fadeIn(50);

		// click and keyboard bindings, only if there's a proper cancel function
		if (options && options.cancelFn) {
			$(backdrop).bind("click", options.cancelFn);
			this.modalHandlers = this.bindDialogKeyboardSupport(options.firstElem, options.lastElem, options.cancelFn);
		}

	},

	dismissModal: function(selector) {
		$(selector).fadeOut();

		$(selector).find("*").off("keydown.modals");
		$('body').off('keydown.modals');

		$('#modal-backdrop').fadeOut(100,
			function() {
				var bg = document.getElementById("modal-backdrop");
				if (bg) {
					document.body.removeChild(bg);
				}
				window._epubController.set("track_position", true);
			}
		);
	},

	/**
	 * Sets up proper keyboard support for dialog-style
	 * controls. Provides initial form element focus,
	 * focus trapping when tabbing through form elements,
	 * and binds Esc key to an arbitrary close/cancel function.
	 */
	bindDialogKeyboardSupport: function(firstElem, lastElem, cancelFn) {

	    $(firstElem).on('keydown.modals',
	        function(evt) {
	            if (evt.which == 9 && evt.shiftKey) {
	                evt.preventDefault();
	                lastElem.focus();
	            }
	        } );

	    $(lastElem).on('keydown.modals',
	        function(evt) {
	            if (evt.which == 9 && !evt.shiftKey) {
	                evt.preventDefault();
					firstElem.focus();
				}
	        } );
	    
	    $('body').on('keydown.modals',
	    	function(evt) {
		    	console.log("I'm still here " + evt.which);
	            if (evt.which == 27) {
	                evt.preventDefault();
	                evt.stopPropagation();
	                cancelFn();
	            }
	        } );
	    
	    if (firstElem) {
		    firstElem.focus();
		    firstElem.focus(); // insurance for IE8
	    }
	}
};

Readium.Models.PackageDocument.prototype.sync = BookshareUtils.makeSyncFunction(
	function(m) {
		return BookshareUtils.resolveEnvironment(BookshareUtils.http + 'www.bookshare.org/getManifest?titleInstanceId=' + m.get('book').get('key'));
	}, 'xml', BookshareUtils.isIE9());
Readium.Models.Toc.prototype.sync = BookshareUtils.makeSyncFunction(function(m) { return m.file_path;}, 'xml');
Readium.Models.SpineItem.prototype.sync = window.BookshareUtils.makeSyncFunction( function(m) {return m.get('href');}, 'xml');


// overrides
Readium.Models.SpineItem.prototype.parse = function(htmlContent) {
	var that = this;
	var doc = $(htmlContent);
	doc.find('head [href]').each(function(i, el) { this.setAttribute('href', BookshareUtils.resolveUrl(this.getAttribute('href'))); });
	doc.find('[src]').each(function(i, el) { this.setAttribute('src', BookshareUtils.resolveUrl(this.getAttribute('src'))); });
	doc.find('aside[epub\\\:type=annotation]').each(function(i, el) { el.style.display = "none"; });
	doc.find('a').each(function(i, el, href) { 
		if (el.getAttribute("href").indexOf("#") == "0") {
			//prepend current file name. XXX this should really be handled server side.
			this.setAttribute("href", BookshareUtils.getRelativePath(that.get("href")) + el.getAttribute("href"));
		}
	});

	// handle page numbers that use title to store their values
	doc.find('[epub\\\:type=pagebreak]').each(
		function(i, el) {
			$(el).addClass("bksPageNumber");
			// normalize storage of page values
			if (el.textContent == "" && el.getAttribute('title') != "") {
				el.textContent = el.getAttribute('title');
			} else if (el.textContent != "" && el.getAttribute('title') == "") {
				el.setAttribute('title', el.textContent);
			}
		});

	this.content = doc[0].documentElement;
};

Readium.Models.PackageDocument.prototype.resolvePath = function(path) {
	return path;
};

Readium.Models.PackageDocument.prototype.initialize = function(attributes, options) {
	this.uri_obj = new URI(this.get('book').get('publication_root'));
	this.on('change:spine_position', this.onSpinePosChanged);
};

// I don't like this at all; we should have a better matcher than an endsWith
Readium.Models.PackageDocument.prototype.spineIndexFromHref = function(href) {
	var spine = this.get("res_spine");
	var h = new URI(this.resolveUri(href));
	var hFileName = h.path.substring(h.path.lastIndexOf("/") + 1);
	for(var i = 0; i < spine.length; i++) {
		var path = spine.at(i).get("href");
		var p = new URI(this.resolveUri(path));
		var separator = p.path.lastIndexOf("%2F") === -1 ? "/" : "%2F";
		var pFileName = p.path.substring(p.path.lastIndexOf(separator) + separator.length);
		if (
			h.scheme === p.scheme &&
			h.authority === p.authority &&
			pFileName == hFileName
			) {
			return i;
		}
	}
	return -1;
};

// configure XDR transport for IE9
if ( window.XDomainRequest ) {
	jQuery.ajaxTransport(function( s ) {
		if ( s.crossDomain && s.async ) {
			if ( s.timeout ) {
				s.xdrTimeout = s.timeout;
				delete s.timeout;
			}
			var xdr;
			return {
				send: function( _, complete ) {
					function callback( status, statusText, responses, responseHeaders ) {
						xdr.onload = xdr.onerror = xdr.ontimeout = jQuery.noop;
						xdr = undefined;
						complete( status, statusText, responses, responseHeaders );
					}
					xdr = new XDomainRequest();
					xdr.onload = function() {
						callback( 200, "OK", { text: xdr.responseText }, "Content-Type: " + xdr.contentType );
					};
					xdr.onerror = function() {
						callback( 404, "Not Found" );
					};
					xdr.onprogress = function() {
						console.log("Fetch in progress");
					};
					xdr.ontimeout = function() {
						callback( 0, "timeout" );
					};
					// xdr.timeout = s.xdrTimeout || Number.MAX_VALUE;
					xdr.timeout = 10000;
					xdr.open( s.type, s.url );
					xdr.send( ( s.hasContent && s.data ) || null );
				},
				abort: function() {
					if ( xdr ) {
						xdr.onerror = jQuery.noop;
						xdr.abort();
					}
				}
			};
		}
	});
};
