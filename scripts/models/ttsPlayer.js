Readium.Models.TTSPlayer = Backbone.Model.extend({
    
    defaults: {
        "tts_playing": false,
        "currentElement": null,
        "bufferSize": 5000
    },

    ALWAYS_SPEAK: ['ol', 'ul', 'dl', 'table'],
    FATAL_EVENTS: ['cancelled', 'error'],
    
    initialize: function() {
        this.controller = this.get('controller');
        this.bufferSize = this.get('bufferSize');
		this.controller.on("change:spine_position", this.stop, this);
		this.controller.on("repagination_event", this._windowSizeChangeHandler, this);
		
        $(window).unload( function() { chrome.tts.stop(); });
    },
    
    play: function() {
        this.set('tts_playing', true);
        this.controller.set('track_position', false);
        this.speak();
    },
    
    stop: function() {
        this.set('tts_playing', false);
        this.set('currentElement', null);
        this.controller.set('track_position', true);
        this.data = null;
        chrome.tts.stop();
    },
    
    speak: function() {
        var self = this;
        var el = self._getCurrentElement();

        // this is a stopgap check to make sure we don't attempt
        // to voice empty utterances. needs more work
        if (el.textContent.trim() == "") {
            self.advanceReadingPosition();
            el = self._getCurrentElement();
        }

        if (el != null) {
            self.data = BeneSpeak.generateSpeechData(el);
            chrome.tts.speak(self.data.utterance,
                {
                    'rate' : self.controller.options.get("speech_rate"),
                    'desiredEventTypes' : ['word'],
                    'onEvent' : self._createCallbackHandler(self)
                });
        } else {
            // we've reached the end of the speakable content
            // resume position tracking
            this.controller.set('track_position', true);
        }
    },
    
    advanceReadingPosition: function() {
        var self = this;
        var nextElement = self._getNextElement(self._getCurrentElement());

        while (!self._isReadable(nextElement)) {
            nextElement = self._getNextElement(nextElement);
            if ((nextElement != null) && (nextElement.textContent.trim().length > 0) && self._hasBlockLevelChildrenOnly(nextElement)) {
                nextElement = nextElement.children[0];
            }
        }
        self._setCurrentElement(nextElement);
    },

    _isReadable: function(el) {
        // a little kludgy -- this will still end up reading elements that are hidden
        // via display:none in class rather than style attribute
        return (
            (el != null) &&
            (el.textContent.trim().length > 0) &&
            ((el.style.display != "none") || (el.getAttribute("epub:type") == "annotation"))
            );
    },

    _setCurrentElement: function(el) {
        var self = this;
        self.set('currentElement', el);
        if (el.getAttribute('id') != null) {
            self.controller.set('reading_position', el.tagName.toLowerCase() + '#' + el.getAttribute('id'));
        }
    },

    _getCurrentElement: function() {
        var self = this;
        if (self.get('currentElement') != null) {
            return self.get('currentElement');
        } else {
            var selector = self.controller.get("reading_position");
            var bodyEl = self.controller.paginator.v.getBody().ownerDocument.body;
            var el = $(bodyEl).find(selector);
            if (el.length == 0) {
                return bodyEl.children[0];
            } else {
                return el[0];
            }
        }
    },

    _getNextElement: function(el) {
        if (el.nextElementSibling != null) {
            return el.nextElementSibling;
        } else if (el.parentElement != null) {
            return this._getNextElement(el.parentElement);
        } else {
            return null;
        }
    },
    
    _hasBlockLevelChildrenOnly: function(el) {
        // we should descend if the current element's children
        // are only block-level elements and empty text nodes.
        // returns true if it's safe to descend
        if (el.hasChildNodes() == true) {
            var limit = el.childNodes.length;
            for (var i = 0; i < limit; i++) {
                var child = el.childNodes[i];
                if (child.nodeType == Node.TEXT_NODE && child.textContent.trim().length > 0) {
                    return false;
                } else if (child.nodeType != Node.TEXT_NODE && !BeneSpeak._isBlockElement(child)) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    },

    _createCallbackHandler: function(self) {
        var data = self.data;
        return function(event) {
            
            if (event.type == 'word') {
                
                if (self.controller.options.get('pagination_mode') == 'scrolling') {
                    data.xOffset = self.controller.paginator.v.getFrame().contentWindow.scrollX;
                    data.yOffset = self.controller.paginator.v.getFrame().contentWindow.scrollY;
                } else {
                    data.xOffset = data._getOffset(data.document.documentElement.style.left);
                    data.yOffset = data._getOffset(data.document.documentElement.style.top);
                }

                var sentenceIndex = data.sentenceAt(event.charIndex);
                if (sentenceIndex >= 0) {
                    data.highlightSentence(sentenceIndex);
                }

                var wordIndex = data.wordAt(event.charIndex);
                if (wordIndex >= 0) {
                    var containingElement = data.words[wordIndex].range.startContainer.parentElement;

                    // Handle image highlighting for prodnote voicing
                    var aside = self._getEnclosingAside(containingElement);
                    if (aside != null && aside.getAttribute('epub:type') == "annotation") {
                        self._highlightImageGroup(aside);
                    } else {
                        data.highlightWord(wordIndex);
                    }
                    self._updatePagePosition(data);
                }
                
            } else if (event.type == 'end') {
                data.clearWordHighlight();
                data.clearSentenceHighlight();
                if (self._getNextElement(self._getCurrentElement()) != null) {
                    self.advanceReadingPosition();
                    self.speak();
                } else {
                    self.stop();
                }
            } else if (event.type == 'interrupted') {
                data.clearWordHighlight();
                data.clearSentenceHighlight();
                self.stop();
            } else if (self.FATAL_EVENTS.indexOf(event.type) >= 0) {
                console.log("A TTS Error was encountered.");
                data.clearWordHighlight();
                data.clearSentenceHighlight();
                self.stop();
            }
        };        
    },
    
    _updatePagePosition: function(data) {
        var v = this.controller.paginator.v;
        if (v.getElemPageNumber != null) {
            if (data._wordRects.length > 0) {
                var pageNum = v.getElemPageNumber(data._wordRects[0]);
                if (!v.pages.isPageVisible(pageNum)) {
                    v.pages.goToPage(pageNum);
                }
            }
        } else {
            if (data._wordRects.length > 0) {
                v.keepInCenter(data._wordRects[0]);
            }
        }
    },
    
    _windowSizeChangeHandler: function() {
        if (this.get('tts_playing')) {
            var tmp = this.data._highlightedSentence;
            this.data.clearSentenceHighlight();
            this.data.highlightSentence(tmp);
        }
    },
    
    _getEnclosingAside: function(el) {
        var n = el;
        while (n != null) {
            if (n.tagName.toLowerCase() == "aside") {
                break;
            } else {
                n = n.parentElement;
            }
        }
        return n;
    },

    _highlightImageGroup: function(el) {
        this.data.clearWordHighlight();
        var container = el.parentElement;
        var rects = container.getClientRects();
        for (var i = 0; i < rects.length; i++) {
            var div = this.data.document.createElement('div');
            this.data.document.body.appendChild(div);
            div.className = 'ttsImgHL';
            div.style.position = 'absolute';
            div.style.top = (rects[i].top + window.scrollY + this.data.yOffset) + 'px';
            div.style.left = (rects[i].left + window.scrollX + this.data.xOffset) + 'px';
            div.style.width = rects[i].width + 'px';
            div.style.height = rects[i].height + 'px';
            this.data._wordRects.push(div);
        }
    },

    _logPath: function(el) {
        var n = el;
        var s = "";
        while (n != null) {
            s = n.tagName + "/" + s;
            n = n.parentElement;
        }
    }
});
