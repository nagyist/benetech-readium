//Readium.Views.BeelineNotificationView = Backbone.View.extend({
//
//	el: '#beeline-notification-modal',
//
//	initialize: function() {
//		console.log("Initializing Beeline Notification Modal.");
//		
//		
//		// if cookie is not set
//		$('#beeline-notification-modal').modal('show');
//		//else do nothing
//	},
//
//	events: {
//    	//"click #beeline-notification-button-yes": 	"BeelineYes",
//    	//"click #beeline-notification-button-no": 	"BeelineNo",
//  	},
//
//	render: function() {
//		return this;
//	}
//  	
//  	//BeelineYes: function(e) {
//  		//this.$el.modal('hide');
//  		//alert("YES, you clicked the Show Beeline Button");
//  		//set cookie to doNotShow
//  		//open settings modal with Beeline selected.
//		
//  	//},
//  	
//  	//BeelineNo: function(e) {
//  		//this.$el.modal('hide');
//  		//alert("No, you do not want to try beeline");
//  		//set cookie to doNotShow
//
//  		//DOES THIS RETURN FOCUS FOR SCREEN READERS?
//  		//$('#help-btn').focus();
//  	//}
//});

Readium.Views.BeelineNotificationView = Backbone.View.extend({

	el: '#beeline-notification-modal',

	initialize: function() {
		console.log("Initializing Beeline Notification Modal");
		//this.$el.modal('show');
	},

	events: {
    	//"click #beeline-notification-button-yes": 	"BeelineYes"
  	},

	render: function() {
		return this;
	},

	BeelineYes: function(e) {
  		this.$el.modal('hide');
  	}
});