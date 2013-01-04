var matches = /(?:http|https)\:\/\/reader(\.\w*?){0,1}\.bookshare\.org(?::8080)?\/viewer\.html\?book=(.*)/.exec(window.location.href);
if (matches != null) {
	var env = matches[1];
	var titleId = matches[2];
	window.location.href = chrome.extension.getURL('views/viewer.html') + '?book=' + titleId;
}