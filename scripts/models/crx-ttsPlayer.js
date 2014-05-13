/**
 * Copy of ttsPlayer.js in its original Chrome Extension form, to support existing installations of the
 * extension. No further development for the Chrome extension is expected.
 */
Readium.Models.TTSPlayer = Backbone.Model.extend({
    
    defaults: {
        "tts_playing": false,
        "currentNode": null,
        "bufferSize": 5000
    },

    ALWAYS_SPEAK: ['ol', 'ul', 'dl', 'table'],
    FATAL_EVENTS: ['cancelled', 'error'],
    
    initialize: function() {
        this.controller = this.get('controller');
        this.bufferSize = this.get('bufferSize');
		this.controller.on("change:spine_position", this.stop, this);
        this.controller.on("goToHref", this.stop, this);
        this.controller.on("change:options-view-shown", this.stop, this);
        this.controller.on("change:toc_visible", this.stop, this);
        this.controller.on("pagesNextPage", this.stop, this);
        this.controller.on("pagesPrevPage", this.stop, this);
		this.controller.on("repagination_event", this._windowSizeChangeHandler, this);
		
        $(window).unload( function() { chrome.tts.stop(); });
    },
    
    play: function() {
        this.set('tts_playing', true);
        this.controller.set('track_position', false);
        this._setCurrentNode(this._getStartNode());
        this.speak();
    },
    
    stop: function() {
        this.set('tts_playing', false);
        this.set('currentNode', null);
        this.controller.set('track_position', true);
        this.data = null;
        chrome.tts.stop();
    },
    
    speak: function() {
        var self = this;

        var n = this._getCurrentNode();

        if (n != null) {
            self.data = BeneSpeak.generateSpeechData(n);
            chrome.tts.speak(self.data.utterance,
                {
                    'rate' : self.controller.options.get("speech_rate"),
                    'requiredEventTypes' : ['word', 'end'],
                    'onEvent' : self._createCallbackHandler(self)
                });
        } else {
            self.stop();
        }
    },
    
    advanceReadingPosition: function() {

        // get the current node
        var n = this._getCurrentNode();

        // get the next readable chunk
        n = this._getNextReadableNode(n);
        if (n != null) {
            this._setCurrentNode(n);
        }
        return n;
    },

    _getNextReadableNode: function(node, doNotAdvance) {
        var n = (doNotAdvance) ? node : this._getNextNode(node);
        if (n != null) {
            if (this._shouldRead(n)) {
                if (this._shouldDescend(n)) {
                    return this._getNextReadableNode(n.childNodes[0], true);
                } else {
                    return n;
                }
            } else {
                return this._getNextReadableNode(n);
            }
        } else {
            return null;
        }
    },

    _shouldDescend: function(el) {
        if (el.nodeType == Node.ELEMENT_NODE) {
            var hasElementChildren = false;
            var nodes = el.childNodes;
            for (var i = 0; i < nodes.length; i++) {
                var thisNode = nodes[i];
                if (thisNode.nodeType == Node.ELEMENT_NODE) {
                    hasElementChildren = true;
                    if (!BeneSpeak._isBlockElement(thisNode)) {
                        return false;
                    }
                }
            }
            return hasElementChildren;
        } else {
            return false;
        }
    },

    _shouldRead: function(node) {
        return (
            (node != null) &&
            (node.textContent.trim().length > 0) &&
            ((node.nodeType != Node.ELEMENT_NODE) || (window.frames[0].getComputedStyle(node).display != "none") || (node.getAttribute("epub:type") == "annotation"))
        );
    },

    _getStartNode: function() {
        var bodyEl = this.controller.paginator.v.getBody().ownerDocument.body;
        return $(bodyEl).find(this.controller.get("reading_position"))[0] || bodyEl.children[0];
    },

    _setCurrentNode: function(n) {
        var self = this;
        self.set('currentNode', n);
        if ((n.nodeType == Node.ELEMENT_NODE) && (n.getAttribute('id') != null)) {
            self.controller.set('reading_position', n.tagName.toLowerCase() + '#' + n.getAttribute('id'));
        }
    },

    _getCurrentNode: function() {
        return this.get("currentNode");
    },

    _getNextNode: function(n) {
        if (n.nextSibling != null) {
            return n.nextSibling;
        } else if (n.parentNode != null) {
            return this._getNextNode(n.parentNode);
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
                if (self.advanceReadingPosition() != null) {
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

        if (n.nodeType == Node.TEXT_NODE) {
            s = "#text";
            n = n.parentElement;
        }

        while (n != null) {
            var id = n.getAttribute("id");
            s = n.tagName + (id != null ? "[" + id + "]" : "") + "/" + s;
            n = n.parentElement;
        }

        return s;
    }
});
