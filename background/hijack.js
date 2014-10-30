var matches = /https\:\/\/(?:(qa|staging)\-){0,1}bookshare\-reader\.s3\.amazonaws\.com\/viewer\.html\?book=(\d*)/.exec(window.location.href);
if (matches != null) {
	var env = matches[1];
	var titleId = matches[2];
	var url = chrome.extension.getURL('views/viewer.html') + '?book=' + titleId;
	if (env != undefined) {
		url = url + "&env=" + env;
	}
	window.location.href = url;
}
