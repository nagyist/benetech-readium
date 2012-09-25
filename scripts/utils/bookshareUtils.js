window.BookshareUtils = {

	environment: 'LIVE',

	makeSyncFunction: function(urlFunction, dataType) {

		return function(method, model, options) {
			var syncUrl = urlFunction(model);

			if(!syncUrl) {
				throw "Cannot sync the model without a valid sync URL.";
			}

			switch (method) {
		        case "read":
		        	console.log("syncing from " + syncUrl);
		        	$.ajax({
		        		'url': syncUrl,
		        		'dataType': dataType,
						'xhrFields': {
							'withCredentials': true
						},
		        		'crossDomain': true,
		        		'success': function(data, textStatus, jqXHR) { options.success(data); },
		        		'error': function(jqXHR, textStatus, errorThrown) { options.error(jqXHR); },
		        	});
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
		if (u.substring(0,2) == "..") {
			normalized = u.substring(2);
		} else {
			normalized = u;
		}
		var manifest = window._epub.packageDocument.get('manifest');
		var item = manifest.find(function(i) { var uu = new URI(i.get('href')); return (uu.path.indexOf(normalized) > -1);});
		if (item == null) {
			console.log(u);
			return null;
		} else {
			return item.get('href');
		}
	},

	setEnvironment: function(href) {
		var match = /(?:http|https)\:\/\/reader(\.\w*?){0,1}\.bookshare\.org\/viewer\.html/.exec(href);
		if (match != null) {
			if (match[1] == '.qa') { BookshareUtils.environment = 'QA'; }
			else if (match[1] == '.staging') { BookshareUtils.environment = 'STAGING'; }
			else if (match[1] == '.dev') { BookshareUtils.environment = 'DEV'; }
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
				uri.authority = 'public.dev.bookshare.org';
			}
		}

		return uri.toString();
	},

	raiseSystemAlert: function(key, params) {
		var template = Handlebars.templates[key];
		$('#system-message-content').html(template((params != null) ? params : {}));
		$('#system-message').modal({backdrop: 'static', keyboard: false});
	},

	dismissSystemAlert: function() {
		$('#system-message').modal('hide');
		$('#system-message-content').html('');
	}
};

Readium.Models.PackageDocument.prototype.sync = BookshareUtils.makeSyncFunction(function(m) { return BookshareUtils.resolveEnvironment('https://www.bookshare.org/getManifest?titleInstanceId=' + m.get('book').get('key'));}, 'xml');
Readium.Models.Toc.prototype.sync = BookshareUtils.makeSyncFunction(function(m) { return m.file_path;}, 'xml');
Readium.Models.SpineItem.prototype.sync = window.BookshareUtils.makeSyncFunction( function(m) {return m.get('href');}, 'xml');


// overrides
Readium.Models.SpineItem.prototype.parse = function(htmlContent) {
	var doc = $(htmlContent);
	doc.find('head [href]').each(function(i, el) { this.setAttribute('href', BookshareUtils.resolveUrl(this.getAttribute('href'))); });
	doc.find('[src]').each(function(i, el) { this.setAttribute('src', BookshareUtils.resolveUrl(this.getAttribute('src'))); });
	this.content = doc[0].documentElement.innerHTML;

	// clean up
	doc[0].removeChild(doc[0].documentElement);
	doc = null;
};

Readium.Models.PackageDocument.prototype.resolvePath = function(path) {
	return path;
};

Readium.Models.PackageDocument.prototype.initialize = function(attributes, options) {
	this.uri_obj = new URI(this.get('book').get('publication_root'));
	this.on('change:spine_position', this.onSpinePosChanged);
};

Readium.Models.PackageDocument.prototype.spineIndexFromHref = function(href) {
	var spine = this.get("res_spine");
	var h = new URI(this.resolveUri(href));
	for(var i = 0; i < spine.length; i++) {
		var path = spine.at(i).get("href");
		var p = new URI(this.resolveUri(path));
		if (
			h.scheme === p.scheme &&
			h.authority === p.authority &&
			h.path === p.path
			) {
			return i;
		}
	}
	return -1;
};
