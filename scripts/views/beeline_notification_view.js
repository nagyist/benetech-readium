Readium.Views.BeelineNotificationView = Backbone.View.extend({

	el: '#beeline-notification-modal',

	initialize: function() {
		//
		$('#beeline-notification-modal').modal('show');

		//$('#help-btn').attr('aria-pressed', 'false');
		//$('#viewer-help-modal').on('shown', function(){
		//	$('#help-heading').focus();
		//	setTimeout(function(){
		//		$('#help-btn').attr('aria-pressed', 'true');
		//	}, 1);
		//}).on('hidden', function(){
		//	setTimeout(function(){
		//		$('#help-btn').attr('aria-pressed', 'false').focus();
		//	}, 1);
		//});
	},

	events: {
    	"click #beeline-notification-button-yes": 	"BeelineYes",
    	"click #beeline-notification-button-no": 	"BeelineNo",
  	},

	render: function() {
		return this;
	},
  	
  	BeelineYes: function(e) {
  		this.$el.modal('hide');
  		alert("YES, you clicked the Show Beeline Button");
  		//set cookie to doNotShow
  		//open settings modal with Beeline selected.
		
  	},
  	
  	BeelineNo: function(e) {
  		this.$el.modal('hide');
  		alert("No, you do not want to try beeline");
  		//set cookie to doNotShow

  		//$('#help-btn').focus();
  	}
});