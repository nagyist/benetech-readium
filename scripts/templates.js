(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['binding_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<iframe scrolling=\"no\" \n		frameborder=\"0\" \n		marginwidth=\"0\" \n		marginheight=\"0\" \n		width=\"100%\" \n		height=\"100%\" \n		class='binding-sandbox'>\n</iframe>";
  });
templates['extracting_item_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<h5>";
  if (helper = helpers.log_message) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.log_message); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</h5>\n<div class=\"progress progress-striped progress-success active \">	\n		<div role=\"status\" aria-live=\"assertive\" aria-relevant=\"all\" class=\"bar\" style=\"width: ";
  if (helper = helpers.progress) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.progress); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "%;\"></div>\n</div>";
  return buffer;
  });
templates['fixed_page_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"fixed-page-margin\">\n	<iframe scrolling=\"no\" \n			frameborder=\"0\" \n			marginwidth=\"0\" \n			marginheight=\"0\" \n			width=\"";
  if (helper = helpers.width) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.width); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "px\" \n			height=\"";
  if (helper = helpers.height) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.height); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "px\" \n			src=\"";
  if (helper = helpers.uri) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.uri); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"\n			title=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"\n			class='content-sandbox'>\n	</iframe>\n</div>";
  return buffer;
  });
templates['iframe_keyboard_shortcuts'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this;

function program1(depth0,data) {
  
  
  return "\n	<a accesskey=\"p\" href=\"#\">Text to speech</a>\n	";
  }

  buffer += "<div id=\"hiddenAccessKeys\" style=\"display:none\">\n	<span>Available actions</span>\n	<a accesskey=\"b\" href=\"#\">Back to Bookshare.org</a>\n	<a accesskey=\"1\" href=\"#\">Next</a>\n	<a accesskey=\"2\" href=\"#\">Previous</a>\n	<a accesskey=\"t\" href=\"#\">Table of contents</a>\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.ttsEnabled), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "	\n	<a accesskey=\"o\" href=\"#\">Options</a>\n	<a accesskey=\"n\" href=\"#\">Toggle night mode</a>\n	<a accesskey=\"f\" href=\"#\">Toggle fullscreen mode</a>\n	<a accesskey=\"h\" href=\"#\">Help</a>\n	<a accesskey=\"x\" href=\"#\">Hide toolbar</a>\n	<a accesskey=\"v\" href=\"#\">Show toolbar</a>\n</div>";
  return buffer;
  });
templates['image_page_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"fixed-page-margin\">\n	<img src=\"";
  if (helper = helpers.uri) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.uri); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" alt=\"\" />\n</div>";
  return buffer;
  });
templates['injected_reflowing_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"flowing-wrapper\">\n	<iframe scrolling=\"no\" \n			frameborder=\"0\" \n			marginwidth=\"0\" \n			marginheight=\"0\" \n			width=\"50%\" \n			height=\"100%\" \n			title=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " by "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.author)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"\n			src=\"/page.xhtml\"\n			id=\"readium-flowing-content\"\n			aria-live=\"polite\"\n			>\n	</iframe>\n</div>";
  return buffer;
  });
templates['injected_scrolling_page_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"scrolling-wrapper\">\n	<iframe scrolling=\"yes\" \n			frameborder=\"0\" \n			marginwidth=\"0\" \n			marginheight=\"0\" \n			width=\"100%\" \n			height=\"100%\" \n			title=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " by "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.author)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"\n			src=\"/page.xhtml\"\n			id='readium-scrolling-content'\n			aria-live=\"polite\"\n			>\n	</iframe>\n</div>";
  return buffer;
  });
templates['integration_error'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h3>An error has occurred</h3>\n<p>\nAn unexpected error has occurred while trying to obtain book information.\nPlease wait a few moments and try reloading this page. If the problem\npersists, please\n<a href=\"https://www.bookshare.org/contactUs\">contact Bookshare Support</a>.\n</p>\n";
  });
templates['integration_error_401'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<h3>Please log in</h3>\n<p>\n	You do not appear to be logged in to Bookshare.\n	Please <a href=\"";
  if (helper = helpers.loginUrl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.loginUrl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">click here</a>\n	to return to Bookshare and log in to your account.\n</p>";
  return buffer;
  });
templates['integration_error_403'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h3>You do not have permission to view this title</h3>\n<p>\nYou do not have permission to access the requested title. If\nyou feel this message is in error please\n<a href=\"https://www.bookshare.org/contactUs\">contact Bookshare Support</a>.\n</p>\n";
  });
templates['integration_error_404'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<h3>Title is not ready for web reading</h3>\n<p>\nThe title you have requested has not been prepared\nfor reading on the web. Please go to the \n<a href=\"";
  if (helper = helpers.titleDetailPageUrl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.titleDetailPageUrl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">title detail page</a>\nand click on the \"Read Now\" link.\n</p>";
  return buffer;
  });
templates['library_item_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  buffer += "<div class='info-wrap clearfix'>\n	<div class='caption book-info'>\n		<h2 class='green info-item title'>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</h2>\n		<div class='info-item author'>"
    + escapeExpression((helper = helpers.orUnknown || (depth0 && depth0.orUnknown),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.author), options) : helperMissing.call(depth0, "orUnknown", ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.author), options)))
    + "</div>\n		<div class='info-item epub-version'>ePUB "
    + escapeExpression((helper = helpers.orUnknown || (depth0 && depth0.orUnknown),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.epub_version), options) : helperMissing.call(depth0, "orUnknown", ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.epub_version), options)))
    + "</div>		\n	</div>\n	\n	<img class='cover-image read' src='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.cover_href)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "' width='150' height='220' alt='Open ePUB "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>\n	\n	<a href=\"#details-modal-"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.key)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\"info-icon\" aria-pressed=\"true\" data-toggle=\"modal\" role=\"button\">\n		<img class='info-icon pull-right' src='/images/library/info-icon.png' height=\"39px\" width=\"39px\" alt='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " information'>\n	</a>\n</div>\n\n<div class=\"caption clearfix buttons\">\n	<a href=\"#todo\" class=\"btn read\" data-book='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.key)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "' role='button'>Read</a>\n	<a href=\"#details-modal-"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.key)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" aria-pressed=\"true\" class=\"btn details\" data-toggle=\"modal\" role=\"button\">\n		Details\n	</a>\n</div>\n\n<div id='details-modal-"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.key)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "' class='modal fade details-modal'>\n<div class=\"offscreenText\"> Details Start </div>\n	<div class=\"pull-left modal-cover-wrap\">\n		<img class='details-cover-image' src='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.cover_href)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "' width='150' height='220' alt='ePUB cover'>\n		<div class=\"caption clearfix modal-buttons\">\n			<a href=\"#\" class=\"btn read\" data-book='<%= data.key %>' role='button'>Read</a>\n			<a class=\"btn btn-danger delete pull-right\" role='button'>Delete</a>\n		</div>\n	</div>\n	<div class='caption modal-book-info'>\n		<div class='green modal-title'>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</div>\n		<div class='modal-detail gap'>Author: "
    + escapeExpression((helper = helpers.orUnknown || (depth0 && depth0.orUnknown),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.author), options) : helperMissing.call(depth0, "orUnknown", ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.author), options)))
    + "</div>\n		<div class='modal-detail'>Publisher: "
    + escapeExpression((helper = helpers.orUnknown || (depth0 && depth0.orUnknown),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.publisher), options) : helperMissing.call(depth0, "orUnknown", ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.publisher), options)))
    + "</div>\n		<div class='modal-detail'>Pub Date: "
    + escapeExpression((helper = helpers.orUnknown || (depth0 && depth0.orUnknown),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.pubdate), options) : helperMissing.call(depth0, "orUnknown", ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.pubdate), options)))
    + "</div>\n		<div class='modal-detail'>Modified Date: "
    + escapeExpression((helper = helpers.orUnknown || (depth0 && depth0.orUnknown),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.modified_date), options) : helperMissing.call(depth0, "orUnknown", ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.modified_date), options)))
    + "</div>\n		<div class='modal-detail gap'>ID: "
    + escapeExpression((helper = helpers.orUnknown || (depth0 && depth0.orUnknown),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.id), options) : helperMissing.call(depth0, "orUnknown", ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.id), options)))
    + "</div>\n		<div class='modal-detail green'>Format: ePUB "
    + escapeExpression((helper = helpers.orUnknown || (depth0 && depth0.orUnknown),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.epub_version), options) : helperMissing.call(depth0, "orUnknown", ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.epub_version), options)))
    + "</div>\n		<div class='modal-detail'>Added: "
    + escapeExpression((helper = helpers.orUnknown || (depth0 && depth0.orUnknown),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.created_at), options) : helperMissing.call(depth0, "orUnknown", ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.created_at), options)))
    + "</div>\n	</div>\n	<div class='modal-detail source'>\n	<span class='green' style=\"padding-right: 10px\">Source:</span>\n		"
    + escapeExpression((helper = helpers.orUnknown || (depth0 && depth0.orUnknown),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.src_url), options) : helperMissing.call(depth0, "orUnknown", ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.src_url), options)))
    + "\n	</div>\n<div class=\"offscreenText\"> Details End </div>\n</div>			";
  return buffer;
  });
templates['library_items_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div id='empty-message'>\n	<p id='empty-message-text' class='green'>\n		Add items to your</br>library here!\n	</p>\n	<img id='empty-arrow' src='/images/library/empty_library_arrow.png' alt='Try adding an ePUB' />\n</div>";
  });
templates['loading_content'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h3>Loading book content...</h3>\n<p style=\"text-align:center\">\n<img src=\"/images/progress_bar.gif\" alt=\"Loading content...\">\n</p>\n";
  });
templates['ncx_nav_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<li class=\"nav-elem\">\n	<a href=\"";
  if (helper = helpers.href) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.href); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">";
  if (helper = helpers.text) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.text); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</a>\n</li>";
  return buffer;
  });
templates['reflowing_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"flowing-wrapper\">\n	<iframe scrolling=\"no\" \n			frameborder=\"0\" \n			marginwidth=\"0\" \n			marginheight=\"0\" \n			width=\"50%\" \n			height=\"100%\" \n			title=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"\n			src=\"";
  if (helper = helpers.uri) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.uri); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"\n			id=\"readium-flowing-content\">\n	</iframe>\n</div>";
  return buffer;
  });
templates['scrolling_page_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"scrolling-content\" class=\"scrolling-page-wrap\">\n	<div class=\"scrolling-page-margin\">\n\n		<iframe scrolling=\"yes\" \n				frameborder=\"0\" \n				marginwidth=\"0\" \n				marginheight=\"0\" \n				width=\"100%\" \n				height=\"100%\" \n				title=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.data)),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"\n				src=\"";
  if (helper = helpers.uri) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.uri); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"\n				class='content-sandbox'>\n		</iframe>\n	</div>\n</div>";
  return buffer;
  });
})();