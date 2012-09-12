window.BookshareUtils = {

	makeSyncFunction: function(urlFunction) {

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
		        		'datatype': 'text',
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
};

Readium.Models.PackageDocument.prototype.sync = BookshareUtils.makeSyncFunction(function(m) { return 'http://martinq-laptop.local:9000/getManifest?title=' + m.get('book').get('key');});
Readium.Models.Toc.prototype.sync = BookshareUtils.makeSyncFunction(function(m) { return m.file_path;});
Readium.Models.SpineItem.prototype.sync = window.BookshareUtils.makeSyncFunction( function(m) {return m.get('href');});


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

Readium.Models.PackageDocument.prototype.resolveUri = function(rel_uri) {
	console.log('QQQ resolveUri: ' + rel_uri);
	return rel_uri;
};

Readium.Models.PackageDocument.prototype.resolvePath = function(path) {
	console.log('QQQ resolvePath: ' + path);
	return path;
};

Readium.Models.PackageDocument.prototype.initialize = function(attributes, options) {
		this.on('change:spine_position', this.onSpinePosChanged);
};
