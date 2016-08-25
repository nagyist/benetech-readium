Readium.Views.OptionsView = Backbone.View.extend({

	el: '#viewer-settings-modal',
	DEFAULT_VOICES: [ 'Alex', 'native' ],

	initialize: function() {
		console.log("Initializing options menu.");
		this.model.on("change:current_margin", this.renderMarginRadio, this);
		this.model.on("change:current_theme", this.renderTheme, this);

		var that = this;

		// hide inapplicable settings when pagination not available
		if (!this.model.get("controller").get("columns_supported")) {
			$('#setting-header-display-legend').toggle(false);
			$('#pagination_mode').toggle(false);
		}

		// hide scrolling setting for iOS devices
		if (this.model.get("controller").get("isIosDevice")) {
			$('#scrolling-option').toggle(false);
		}

		// set TTS visibility based on browser support
		$('.ttsOnly').toggle(BookshareUtils.hasSpeechAPI() || (!!window.chrome && !!window.chrome.tts));

		Acc.rg = {
			theme: new Acc.RadioGroup('theme-radio-group', ' .' + this.model.get("current_theme"),
				function(el){
					var id = el.id;
					if(id === "default-theme-option" ) that.model.set("current_theme", "default-theme");
					if(id === "night-theme-option" ) that.model.set("current_theme", "night-theme");
					if(id === "parchment-theme-option" ) that.model.set("current_theme", "parchment-theme");
					if(id === "beeline-theme-option" ) that.model.set("current_theme", "beeline-theme");
				}
			),
			margin: new Acc.RadioGroup('margin-radio-wrapper', ' #margin-option-' + this.model.get("current_margin"),
				function(el){
					var id = el.id,
					num = id[id.length - 1];
					if(num === "1" ) that.model.set("current_margin", 1);
					if(num === "2" ) that.model.set("current_margin", 2);
					if(num === "3" ) that.model.set("current_margin", 3);
					if(num === "4" ) that.model.set("current_margin", 4);
					if(num === "5" ) that.model.set("current_margin", 5);
				}
			)
		};
		$('#options-btn').attr('aria-pressed', 'false');
		$('#viewer-settings-modal').on('show', function(){
			that.render();
		});
		$('#viewer-settings-modal').on('shown', function(){
			that.model.get("controller").set("options-view-shown", true);
			$('#options-heading').focus();
			setTimeout(function(){
				$('#options-btn').attr('aria-pressed', 'true');
			}, 1);
		}).on('hidden', function(){
			that.model.get("controller").set("options-view-shown", false);
			setTimeout(function(){
				$('#options-btn').attr('aria-pressed', 'false').focus();
			}, 1);
		});
	},

	renderBeelineMenu: function() {
		var vis = false;
		var beeline = this.model.get("controller").get("beeline");
		console.log("renderBeelineMenu: " + beeline);
		if( beeline && beeline == 'on') {
			vis = true;
		}
		// Only display if beta option was selected
		this.$("#beeline-beta-menu").toggle(vis);
		this.$("#beeline-theme-option").toggle(vis);
		this.renderBeelineOption();

	},

	renderBeelineOption: function() {
		var theme = this.model.get("beeline_theme");
		$("ul#beeline-beta-menu li").removeClass("active");
		$("li#" + theme + "-button").addClass("active");
	},
		
	render: function() {
		this.renderPagination();
		this.renderTheme();
		this.renderBeelineMenu();
		this.renderMarginRadio();
		this.renderFontSize();
        this.renderFontFace();
		this.renderDisplayPageNumbers();
		if (BookshareUtils.hasSpeechAPI()) {
			this.renderSpeechRate();
			this.renderVoiceOptions();
			if (!!window.chrome) {
				speechSynthesis.onvoiceschanged = _.bind(this.renderVoiceOptions, this);
			}
		}
		return this;
	},

	renderTheme: function() {
		var themePref = this.model.get("current_theme");
		this.$("#default-theme-option").toggleClass("selected", (themePref == 'default-theme'));
		this.$("#night-theme-option").toggleClass("selected", (themePref == 'night-theme'));
		this.$("#parchment-theme-option").toggleClass("selected", (themePref == 'parchment-theme'));
		this.$("#beeline-theme-option").toggleClass("selected", (themePref == 'beeline-theme'));
		return this;
	},

	renderMarginRadio: function() {
		var id = "#margin-option-" + this.model.get("current_margin");
		this.$('.margin-radio').toggleClass("selected", false);
		this.$(id).toggleClass("selected", true);
		return this;
	},

	renderFontSize: function() {
		var val = this.model.get("font_size");
		this.$("#font-size-input").val(val);
	},

	renderFontFace: function() {
		var val = this.model.get("font_face");
		this.$("#font-face-input").val(val);
	},

	renderPagination: function() {
		var val = this.model.get("pagination_mode");
		this.$("#pagination-mode-input").val(val);
	},

	filterVoiceOptions: function(v) {
		return v.localService && (v.name == "US English Female TTS (by Google)" || !/google/i.test(v.voiceURI));
	},

	renderVoiceOptions: function() {
		var voiceDefault;
		var select = $("#voice-input");
		select.children().remove();
		var voices = speechSynthesis.getVoices().filter(this.filterVoiceOptions);
		for (i = 0; i < voices.length; i++) {
			var voice = voices[i];
			var option = $("<option>").text(voice.name).val(voice.voiceURI);
			select.append(option);
			// Default to first available voice, "Alex", or "native", whichever's last
			if (i == 0 || this.DEFAULT_VOICES.indexOf(voice.name) >= 0) {
				voiceDefault = voice.voiceURI;
			}
		}
		// update the default one
		var defaultOption = select.find("option[value='" + voiceDefault + "']");
		defaultOption.text(defaultOption.text() + ' (default)');
		var voicePref = this.model.get("voice_uri");
        select.val(voicePref ? voicePref : voiceDefault);
        var controller = this.model.get("controller");
        controller.set("voice_uri", select.val());
        controller.trigger("change:voice_uri");
	},

    renderSpeechRate: function() {
        var val = this.model.get("speech_rate");
        this.$("#speech-rate-input").val(val);
    },

	renderDisplayPageNumbers: function() {
		this.$("#display-page-numbers").prop('checked', this.model.get("display_page_numbers"));
	},

	events: {
    	"click .theme-option": 			"selectTheme",
    	"click .margin-radio": 			"selectMargin",
    	"click #cancel-settings-but": 	"cancelSettings",
		"click #save-settings-but": 	"applySettings",
		"click #bright-button": 	function() { 
			this.selectBeelineTheme("bright");
		},
		"click #dark-button": 	function() { 
			this.selectBeelineTheme("dark");
		},
		"click #blues-button": 	function() { 
			this.selectBeelineTheme("blues");
		},
		"click #gray-button": 	function() { 
			this.selectBeelineTheme("gray");
		},
		"click #night_gray-button": 	function() { 
			this.selectBeelineTheme("night_gray");
		}
  	},

  	selectBeelineTheme: function(theme) {
  		if(theme == "gray") {
  			console.log("Selecting gray theme.");
  		}
		this.model.set("current_theme", "beeline-theme");
  		this.model.set("beeline_theme", theme);
  		this.renderTheme();
		this.renderBeelineOption();
  	},

  	selectTheme: function(e) {
  		var id = e.srcElement ? e.srcElement.id : '';
		if (id && e.srcElement && Acc.rg && Acc.rg.theme && e.srcElement != Acc.rg.theme.selected) Acc.rg.theme.set(id);
  		if(id === "default-theme-option" ) this.model.set("current_theme", "default-theme");
		if(id === "night-theme-option" ) this.model.set("current_theme", "night-theme");
		if(id === "parchment-theme-option" ) this.model.set("current_theme", "parchment-theme");
		if(id === "beeline-theme-option" ) this.model.set("current_theme", "beeline-theme");
		e.stopPropagation();
  	},

  	selectMargin: function(e) {
  		var id = e.srcElement.id;
		if (e.srcElement && Acc.rg && Acc.rg.margin && e.srcElement != Acc.rg.margin.selected) Acc.rg.margin.set(id);
  		var num = id[id.length - 1];
  		if(num === "1" ) this.model.set("current_margin", 1);
		if(num === "2" ) this.model.set("current_margin", 2);
		if(num === "3" ) this.model.set("current_margin", 3);
		if(num === "4" ) this.model.set("current_margin", 4);
		if(num === "5" ) this.model.set("current_margin", 5);
		e.stopPropagation();
  	},

  	cancelSettings: function(e) {
  		this.$el.modal('hide');
  		this.model.resetOptions();
		$('#options-btn').focus();
  	},

  	applySettings: function(e) {
  		// extract options from non-fancy UI elements
		this.model.set("display_page_numbers", this.$("#display-page-numbers").prop('checked'));
		this.model.set("pagination_mode", $("#pagination-mode-input").val());
		this.model.set("font_size", parseInt($("#font-size-input").val(), 10));
		this.model.set("font_face", $("#font-face-input").val());
		this.model.set("speech_rate", parseFloat($("#speech-rate-input").val()));
		this.model.set("voice_uri", $("#voice-input").val());

  		this.model.applyOptions();
  		this.$el.modal('hide');
		$('#options-btn').focus();
  	}


});
