Readium.Models.ReadiumOptions = Backbone.Model.extend({

	initialize: function() {
		this.set("id", "singleton");
	},

	defaults: {
		hijack_epub_urls: false,
		verbose_unpacking: true,
		display_page_numbers: true,
		font_size: 10,
		current_margin: 3,
		current_theme: "default-theme"
	},

	sync: Readium.Utils.LocalStorageAdaptor("READIUM_OPTIONS"),

	applyOptions: function() {
		var controller = this.get("controller");

		// set everything but two_up
		controller.set({
			"font_size": 			this.get("font_size"),
			"display_page_numbers":	this.get("display_page_numbers"),
			"current_theme": 		this.get("current_theme"),
			"current_margin": 		this.get("current_margin")
		});
		this.save();
	},

	resetOptions: function() {
		// save the controller reference
		var controller = this.get("controller");
		this.fetch();
		this.set("controller", controller);
	}
}, {
	getInstance: function() {
		var instance = new Readium.Models.ReadiumOptions();
		instance.fetch({
			error: function() {
				localStorage.setItem("READIUM_OPTIONS", "");
				instance.save();
			}
		});
		return instance;
	}
});