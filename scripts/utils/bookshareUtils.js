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
};

Readium.Models.PackageDocument.prototype.sync = BookshareUtils.makeSyncFunction(function(m) { return 'http://martinq-laptop.local:9000/getManifest?title=' + m.get('book').get('key');});
Readium.Models.Toc.prototype.sync = BookshareUtils.makeSyncFunction(function(m) { return m.file_path;});
//Readium.Models.SpineItem.prototype.sync = window.BookshareUtils.makeSyncFunction('http://martinq-laptop.local:9000/getManifest?title=', 'key');