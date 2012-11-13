Readium.Views.ToolbarView = Backbone.View.extend({

	el: "#toolbar-el",

	initialize: function() {
		this.model.on("change:toolbar_visible", this.renderBarVibility, this);
		this.model.on("change:full_screen", this.renderFullScreen, this);
		this.model.on("change:current_theme", this.renderThemeButton, this);
	},

	render: function() {
		this.renderBarVibility();
		this.renderFullScreen();
		this.renderThemeButton();
		return this;
	},

	renderBarVibility: function() {
		var visible = this.model.get("toolbar_visible");
		this.$('#show-toolbar-button').toggle( !visible );
		this.$('#top-bar').toggle( visible );
		return this;
	},

	renderFullScreen: function() {
		var isFs = this.model.get("full_screen");
		this.$("#go-to-fs-ico").toggle( !isFs );
		this.$("#leave-fs-ico").toggle( isFs );
		$('#fs-toggle-btn').attr('title', isFs ? 'Fullscreen on' : 'Fullscreen off');
		$('#fsOT').html(isFs ? 'Fullscreen on' : 'Fullscreen off');
		return this;
	},

	renderThemeButton: function() {
		var isNight = this.model.get("current_theme") === "night-theme";
		this.$('#night-to-day-ico').toggle(isNight);
		this.$('#day-to-night-ico').toggle(!isNight);
		$('#nightmode-btn').attr('title', isNight ? 'Nightmode on' : 'Nightmode off');
		$('#nmOT').html(isNight ? 'Nightmode on' : 'Nightmode off');
		return this;
	},

	events: {
		"click #hide-toolbar-button": "hide_toolbar",
		"click #show-toolbar-button": "show_toolbar",
		"click #fs-toggle-btn": "toggle_fs",
		"click #toggle-toc-btn": "toggle_toc",
		"click #nightmode-btn": "toggle_night_mode",
		"click #play-tts-btn": "play_tts"
	},

	show_toolbar: function(e) {
		e.preventDefault();
		this.model.set("toolbar_visible", true);
	},

	hide_toolbar: function(e) {
		e.preventDefault();
		this.model.set("toolbar_visible", false);
	},

	toggle_fs: function(e) {
		e.preventDefault();
		this.model.toggleFullScreen();
	},

	toggle_toc: function(e) {
		e.preventDefault();
		this.model.toggleToc();
	},

	toggle_night_mode: function() {
		var current_theme = this.model.get("current_theme");
		if(current_theme === "night-theme") {
			if (this.model.get("day_theme")) {
				this.model.set("current_theme", this.model.get("day_theme"));
			} else {
				this.model.set("current_theme", "default-theme");
			}
		} else {
			this.model.set("day_theme", this.model.get("current_theme"));
			this.model.set("current_theme", "night-theme");
		}
	},

	play_tts: function() {
		if(this.model.ttsPlayer.get("tts_playing")) {
			this.model.ttsPlayer.stop();
		} else {
			this.model.ttsPlayer.play();
		}
	}
});
