Readium.Views.BeelineNotificationView = Backbone.View.extend({

	el: '#beeline-notification-modal',

	initialize: function() {
		console.log("Initializing Beeline Notification Modal");
		$('#beeline-notification-modal').modal('show');
		
		//this.$el.modal('show');
	},

	events: {
    	"click #beeline-notification-button-yes": 	"BeelineYes"
  	},

	render: function() {
		return this;
	},

	BeelineYes: function(e) {
  		this.$el.modal('hide');
  	}
});