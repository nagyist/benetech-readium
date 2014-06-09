Readium.Views.OptionsView = Backbone.View.extend({

	el: '#viewer-settings-modal',
	DEFAULT_VOICES: [ 'Alex', 'native' ],

	initialize: function() {
		this.model.on("change:pagination_mode", this.renderPagination, this);
		this.model.on("change:display_page_numbers", this.renderDisplayPageNumbers, this);
		this.model.on("change:current_margin", this.renderMarginRadio, this);
		this.model.on("change:font_size", this.renderFontSize, this);
		this.model.on("change:speech_rate", this.renderSpeechRate, this);
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

		Acc.rg = {
			theme: new Acc.RadioGroup('theme-radio-group', ' .' + this.model.get("current_theme"),
				function(el){
					var id = el.id;
					if(id === "default-theme-option" ) that.model.set("current_theme", "default-theme");
					if(id === "night-theme-option" ) that.model.set("current_theme", "night-theme");
					if(id === "parchment-theme-option" ) that.model.set("current_theme", "parchment-theme");
					if(id === "ballard-theme-option" ) that.model.set("current_theme", "ballard-theme");
					if(id === "vancouver-theme-option" ) that.model.set("current_theme", "vancouver-theme");
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
		
	render: function() {
		this.renderPagination();
		this.renderTheme();
		this.renderMarginRadio();
		this.renderFontSize();
		this.renderSpeechRate();
		if (BookshareUtils.hasSpeechAPI()) {
			this.renderVoiceOptions();
			if (window.chrome) {
				speechSynthesis.onvoiceschanged = _.bind(this.renderVoiceOptions, this);
			}
		}
		this.renderDisplayPageNumbers();
		return this;
	},

	renderTheme: function() {
		var themePref = this.model.get("current_theme");
		this.$("#default-theme-option").toggleClass("selected", (themePref == 'default-theme'));
		this.$("#night-theme-option").toggleClass("selected", (themePref == 'night-theme'));
		this.$("#parchment-theme-option").toggleClass("selected", (themePref == 'parchment-theme'));
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

	renderPagination: function() {
		var val = this.model.get("pagination_mode");
		this.$("#pagination-mode-input").val(val);
	},

	renderVoiceOptions: function() {
		var voiceDefault;
		var select = $("#voice-input");
		var voices = speechSynthesis.getVoices();
		for (i = 0; i < voices.length; i++) {
			var voice = voices[i];
			if (voice.localService && !/google/i.test(voice.voiceURI)) {
				var option = $("<option>").text(voice.name).val(voice.voiceURI);
				select.append(option);
				// Default to first available voice, "Alex", or "native", whichever's last
				if (i == 0 || this.DEFAULT_VOICES.indexOf(voice.name) >= 0) {
					voiceDefault = voice.voiceURI;
				}
			}
		}
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
		this.$("#display-page-numbers")[0].checked = this.model.get("display_page_numbers");
	},

	events: {
    	"click .theme-option": 			"selectTheme",
    	"click .margin-radio": 			"selectMargin",
    	"change #display-page-numbers":	"clickDisplayPageNumbers",
    	"click #cancel-settings-but": 	"cancelSettings",
		"click #save-settings-but": 	"applySettings",
    	"change #font-size-input": 		"extractFontSize",
    	"change #pagination-mode-input":"extractPaginationMode",
    	"change #speech-rate-input":     "extractSpeechRate",
    	"change #voice-input":			"extractVoice"
  	},

  	extractFontSize: function(e) {
		var val = $("#font-size-input").val();
		val = parseInt(val, 10);
		this.model.set("font_size", val);
	},

  	extractPaginationMode: function(e) {
		var val = $("#pagination-mode-input").val();
		this.model.set("pagination_mode", val);
	},

    extractSpeechRate: function(e) {
        var val = $("#speech-rate-input").val();
        val = parseFloat(val);
        this.model.set("speech_rate", val);
    },
    
    extractVoice: function(e) {
    	var val = $("#voice-input").val();
    	this.model.set("voice_uri", val);
    },

  	selectTheme: function(e) {
  		var id = e.srcElement ? e.srcElement.id : '';
		if (id && e.srcElement && Acc.rg && Acc.rg.theme && e.srcElement != Acc.rg.theme.selected) Acc.rg.theme.set(id);
  		if(id === "default-theme-option" ) this.model.set("current_theme", "default-theme");
		if(id === "night-theme-option" ) this.model.set("current_theme", "night-theme");
		if(id === "parchment-theme-option" ) this.model.set("current_theme", "parchment-theme");
		if(id === "ballard-theme-option" ) this.model.set("current_theme", "ballard-theme");
		if(id === "vancouver-theme-option" ) this.model.set("current_theme", "vancouver-theme");
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

  	clickDisplayPageNumbers: function(e) {
  		if (!e.srcElement) e.srcElement = e.target;
  		this.model.set("display_page_numbers", e.srcElement.checked);
  	},

  	cancelSettings: function(e) {
  		this.$el.modal('hide');
  		this.model.resetOptions();
		$('#options-btn').focus();
  	},

  	applySettings: function(e) {
  		// extract options from non-fancy UI elements

  		this.model.applyOptions();
  		this.$el.modal('hide');
		$('#options-btn').focus();
  	}


});