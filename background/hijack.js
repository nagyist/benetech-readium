console.log(window.location.href);
var matches = /(?:http|https)\:\/\/reader(\.\w*?){0,1}\.bookshare\.org\/viewer\.html\?book=(.*)/.exec(window.location.href);
console.log(matches);
if (matches != null) {
	var env = matches[1];
	var titleId = matches[2];
	alert(chrome.extension.getURL('views/viewer.html') + '?title=' + titleId);
	window.location.href = chrome.extension.getURL('views/viewer.html') + '?book=' + titleId;
}