(function(){var h=Handlebars.template,i=Handlebars.templates=Handlebars.templates||{};i.binding_template=h(function(){return'<iframe scrolling="no" \n\t\tframeborder="0" \n\t\tmarginwidth="0" \n\t\tmarginheight="0" \n\t\twidth="100%" \n\t\theight="100%" \n\t\tclass=\'binding-sandbox\'>\n</iframe>'});i.extracting_item_template=h(function(e,b,d){var d=d||e.helpers,e="",a,c=d.helperMissing,f=this.escapeExpression;e+="<h5>";a=(a=d.log_message)||b.log_message;typeof a==="function"?a=a.call(b,{hash:{}}):
a===void 0&&(a=c.call(b,"log_message",{hash:{}}));e+=f(a)+'</h5>\n<div class="progress progress-striped progress-success active ">\t\n\t\t<div role="status" aria-live="assertive" aria-relevant="all" class="bar" style="width: ';a=(a=d.progress)||b.progress;typeof a==="function"?a=a.call(b,{hash:{}}):a===void 0&&(a=c.call(b,"progress",{hash:{}}));e+=f(a)+'%;"></div>\n</div>';return e});i.fixed_page_template=h(function(e,b,d){var d=d||e.helpers,e="",a,c=d.helperMissing,f=this.escapeExpression;e+='<div class="fixed-page-margin">\n\t<iframe scrolling="no" \n\t\t\tframeborder="0" \n\t\t\tmarginwidth="0" \n\t\t\tmarginheight="0" \n\t\t\twidth="';
a=(a=d.width)||b.width;typeof a==="function"?a=a.call(b,{hash:{}}):a===void 0&&(a=c.call(b,"width",{hash:{}}));e+=f(a)+'px" \n\t\t\theight="';a=(a=d.height)||b.height;typeof a==="function"?a=a.call(b,{hash:{}}):a===void 0&&(a=c.call(b,"height",{hash:{}}));e+=f(a)+'px" \n\t\t\tsrc="';a=(a=d.uri)||b.uri;typeof a==="function"?a=a.call(b,{hash:{}}):a===void 0&&(a=c.call(b,"uri",{hash:{}}));e+=f(a)+"\"\n\t\t\tclass='content-sandbox'>\n\t</iframe>\n</div>";return e});i.image_page_template=h(function(e,
b,d){var d=d||e.helpers,e="",a=d.helperMissing,c=this.escapeExpression;e+='<div class="fixed-page-margin">\n\t<img src="';d=d.uri||b.uri;typeof d==="function"?d=d.call(b,{hash:{}}):d===void 0&&(d=a.call(b,"uri",{hash:{}}));e+=c(d)+'" >\n</div>';return e});i.library_item_template=h(function(e,b,d){var d=d||e.helpers,e="",a,c,f=d.helperMissing,g=this.escapeExpression;e+="<div class='info-wrap clearfix'>\n\t<div class='caption book-info'>\n\t\t<h2 class='green info-item title'>";a=(c=d.data)||b.data;
a=a===null||a===void 0||a===!1?a:a.title;typeof a==="function"?a=a.call(b,{hash:{}}):a===void 0&&(a=f.call(b,"data.title",{hash:{}}));e+=g(a)+"</h2>\n\t\t<div class='info-item author'>";a=(c=d.data)||b.data;a=a===null||a===void 0||a===!1?a:a.author;c=(c=d.orUnknown)||b.orUnknown;a=typeof c==="function"?c.call(b,a,{hash:{}}):c===void 0?f.call(b,"orUnknown",a,{hash:{}}):c;e+=g(a)+"</div>\n\t\t<div class='info-item epub-version'>ePUB ";a=(c=d.data)||b.data;a=a===null||a===void 0||a===!1?a:a.epub_version;
c=(c=d.orUnknown)||b.orUnknown;a=typeof c==="function"?c.call(b,a,{hash:{}}):c===void 0?f.call(b,"orUnknown",a,{hash:{}}):c;e+=g(a)+"</div>\n\t\t\n\t</div>\n\t\n\t<img class='cover-image read' src='";a=(c=d.data)||b.data;a=a===null||a===void 0||a===!1?a:a.cover_href;typeof a==="function"?a=a.call(b,{hash:{}}):a===void 0&&(a=f.call(b,"data.cover_href",{hash:{}}));e+=g(a)+"' width='150' height='220' alt='Open ePUB ";a=(c=d.data)||b.data;a=a===null||a===void 0||a===!1?a:a.title;typeof a==="function"?
a=a.call(b,{hash:{}}):a===void 0&&(a=f.call(b,"data.title",{hash:{}}));e+=g(a)+"'>\n\t\n\t<a href=\"#details-modal-";a=(c=d.data)||b.data;a=a===null||a===void 0||a===!1?a:a.key;typeof a==="function"?a=a.call(b,{hash:{}}):a===void 0&&(a=f.call(b,"data.key",{hash:{}}));e+=g(a)+'" class="info-icon" data-toggle="modal" role="button">\n\t\t<img class=\'info-icon pull-right\' src=\'/images/library/info-icon.png\' height="39px" width="39px" alt=\'';a=(c=d.data)||b.data;a=a===null||a===void 0||a===!1?a:a.title;
typeof a==="function"?a=a.call(b,{hash:{}}):a===void 0&&(a=f.call(b,"data.title",{hash:{}}));e+=g(a)+' information\'>\n\t</a>\n</div>\n\n<div class="caption clearfix buttons">\n\t<a href="#todo" class="btn read" data-book=\'';a=(c=d.data)||b.data;a=a===null||a===void 0||a===!1?a:a.key;typeof a==="function"?a=a.call(b,{hash:{}}):a===void 0&&(a=f.call(b,"data.key",{hash:{}}));e+=g(a)+"' role='button'>Read</a>\n\t<a href=\"#details-modal-";a=(c=d.data)||b.data;a=a===null||a===void 0||a===!1?a:a.key;
typeof a==="function"?a=a.call(b,{hash:{}}):a===void 0&&(a=f.call(b,"data.key",{hash:{}}));e+=g(a)+'" class="btn details" data-toggle="modal" role="button">\n\t\tDetails\n\t</a>\n</div>\n\n<div id=\'details-modal-';a=(c=d.data)||b.data;a=a===null||a===void 0||a===!1?a:a.key;typeof a==="function"?a=a.call(b,{hash:{}}):a===void 0&&(a=f.call(b,"data.key",{hash:{}}));e+=g(a)+"' class='modal fade details-modal'>\n\t<div class=\"pull-left modal-cover-wrap\">\n\t\t<img class='details-cover-image' src='";
a=(c=d.data)||b.data;a=a===null||a===void 0||a===!1?a:a.cover_href;typeof a==="function"?a=a.call(b,{hash:{}}):a===void 0&&(a=f.call(b,"data.cover_href",{hash:{}}));e+=g(a)+"' width='150' height='220' alt='ePUB cover'>\n\t\t<div class=\"caption clearfix modal-buttons\">\n\t\t\t<a href=\"#\" class=\"btn read\" data-book='<%= data.key %>' role='button'>Read</a>\n\t\t\t<a class=\"btn btn-danger delete pull-right\" role='button'>Delete</a>\n\t\t</div>\n\t</div>\n\t<div class='caption modal-book-info'>\n\t\t<h3 class='green modal-title'>";
a=(c=d.data)||b.data;a=a===null||a===void 0||a===!1?a:a.title;typeof a==="function"?a=a.call(b,{hash:{}}):a===void 0&&(a=f.call(b,"data.title",{hash:{}}));e+=g(a)+"</h3>\n\t\t<div class='modal-detail gap'>Author: ";a=(c=d.data)||b.data;a=a===null||a===void 0||a===!1?a:a.author;c=(c=d.orUnknown)||b.orUnknown;a=typeof c==="function"?c.call(b,a,{hash:{}}):c===void 0?f.call(b,"orUnknown",a,{hash:{}}):c;e+=g(a)+"</div>\n\t\t<div class='modal-detail'>Publisher: ";a=(c=d.data)||b.data;a=a===null||a===void 0||
a===!1?a:a.publisher;c=(c=d.orUnknown)||b.orUnknown;a=typeof c==="function"?c.call(b,a,{hash:{}}):c===void 0?f.call(b,"orUnknown",a,{hash:{}}):c;e+=g(a)+"</div>\n\t\t<div class='modal-detail'>Pub Date: ";a=(c=d.data)||b.data;a=a===null||a===void 0||a===!1?a:a.pubdate;c=(c=d.orUnknown)||b.orUnknown;a=typeof c==="function"?c.call(b,a,{hash:{}}):c===void 0?f.call(b,"orUnknown",a,{hash:{}}):c;e+=g(a)+"</div>\n\t\t<div class='modal-detail'>Modified Date: ";a=(c=d.data)||b.data;a=a===null||a===void 0||
a===!1?a:a.modified_date;c=(c=d.orUnknown)||b.orUnknown;a=typeof c==="function"?c.call(b,a,{hash:{}}):c===void 0?f.call(b,"orUnknown",a,{hash:{}}):c;e+=g(a)+"</div>\n\t\t<div class='modal-detail gap'>ID: ";a=(c=d.data)||b.data;a=a===null||a===void 0||a===!1?a:a.id;c=(c=d.orUnknown)||b.orUnknown;a=typeof c==="function"?c.call(b,a,{hash:{}}):c===void 0?f.call(b,"orUnknown",a,{hash:{}}):c;e+=g(a)+"</div>\n\t\t<div class='modal-detail green'>Format: ePUB ";a=(c=d.data)||b.data;a=a===null||a===void 0||
a===!1?a:a.epub_version;c=(c=d.orUnknown)||b.orUnknown;a=typeof c==="function"?c.call(b,a,{hash:{}}):c===void 0?f.call(b,"orUnknown",a,{hash:{}}):c;e+=g(a)+"</div>\n\t\t<div class='modal-detail'>Added: ";a=(c=d.data)||b.data;a=a===null||a===void 0||a===!1?a:a.created_at;c=(c=d.orUnknown)||b.orUnknown;a=typeof c==="function"?c.call(b,a,{hash:{}}):c===void 0?f.call(b,"orUnknown",a,{hash:{}}):c;e+=g(a)+"</div>\n\t</div>\n\t<div class='modal-detail source'>\n\t<span class='green' style=\"padding-right: 10px\">Source:</span>\n\t\t";
a=(c=d.data)||b.data;a=a===null||a===void 0||a===!1?a:a.src_url;c=(c=d.orUnknown)||b.orUnknown;a=typeof c==="function"?c.call(b,a,{hash:{}}):c===void 0?f.call(b,"orUnknown",a,{hash:{}}):c;e+=g(a)+"\n\t</div>\n</div>\t\t\t";return e});i.library_items_template=h(function(){return"<div id='empty-message'>\n\t<p id='empty-message-text' class='green'>\n\t\tAdd items to your</br>library here!\n\t</p>\n\t<img id='empty-arrow' src='/images/library/empty_library_arrow.png' alt='' />\n</div>"});i.ncx_nav_template=
h(function(e,b,d){var d=d||e.helpers,e="",a,c=d.helperMissing,f=this.escapeExpression;e+='<li class="nav-elem">\n\t<a href="';a=(a=d.href)||b.href;typeof a==="function"?a=a.call(b,{hash:{}}):a===void 0&&(a=c.call(b,"href",{hash:{}}));e+=f(a)+'">';a=(a=d.text)||b.text;typeof a==="function"?a=a.call(b,{hash:{}}):a===void 0&&(a=c.call(b,"text",{hash:{}}));e+=f(a)+"</a>\n</li>";return e});i.reflowing_template=h(function(e,b,d){var d=d||e.helpers,e="",a=d.helperMissing,c=this.escapeExpression;e+='<div id="flowing-wrapper">\n\t<iframe scrolling="no" \n\t\t\tframeborder="0" \n\t\t\tmarginwidth="0" \n\t\t\tmarginheight="0" \n\t\t\twidth="50%" \n\t\t\theight="100%" \n\t\t\tsrc="';
d=d.uri||b.uri;typeof d==="function"?d=d.call(b,{hash:{}}):d===void 0&&(d=a.call(b,"uri",{hash:{}}));e+=c(d)+'"\n\t\t\tid="readium-flowing-content">\n\t</iframe>\n</div>';return e});i.scrolling_page_template=h(function(e,b,d){var d=d||e.helpers,e="",a=d.helperMissing,c=this.escapeExpression;e+='<div id="scrolling-content" class="scrolling-page-wrap">\n\t<div class="scrolling-page-margin">\n\n\t\t<iframe scrolling="yes" \n\t\t\t\tframeborder="0" \n\t\t\t\tmarginwidth="0" \n\t\t\t\tmarginheight="0" \n\t\t\t\twidth="100%" \n\t\t\t\theight="100%" \n\t\t\t\tsrc="';
d=d.uri||b.uri;typeof d==="function"?d=d.call(b,{hash:{}}):d===void 0&&(d=a.call(b,"uri",{hash:{}}));e+=c(d)+"\"\n\t\t\t\tclass='content-sandbox'>\n\t\t</iframe>\n\t</div>\n</div>";return e})})();