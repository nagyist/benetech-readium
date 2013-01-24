Readium.Views.HelpView = Backbone.View.extend({

	el: '#viewer-help-modal',

	events: {
    	"click #cancel-help-but": 	"hide"
  	},

  	initialize: function(options) {
		this.parentView = options.parentView;
  	},

	render: function() {
		return this;
	},

  	show: function(e) {
  		var that = this;
		BookshareUtils.raiseModal(that.el, {
			firstElem: document.getElementById("help-heading"),
			lastElem: document.getElementById("cancel-help-but"),
			cancelFn: function() { that.hide(); }
		});
  	},

  	hide: function(e) {
		BookshareUtils.dismissModal(this.el);
  	}
});