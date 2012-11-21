Readium.Models.LibraryItem=Backbone.Model.extend({idAttribute:"key",getViewBookUrl:function(){return"/viewer.html?book="+this.get("key")},openInReader:function(){window.location=this.getViewBookUrl()}});Readium.Collections.LibraryItems=Backbone.Collection.extend({model:Readium.Models.LibraryItem,url:"/epub_content/metadata.json"});
Readium.Views.LibraryItemView=Backbone.View.extend({tagName:"div",className:"book-item clearfix",initialize:function(){_.bindAll(this,"render");this.template=Handlebars.templates.library_item_template},render:function(){var a=this.template({data:this.model.toJSON()});$(this.el).html(a);this.$(".delete").toggle(!1);return this},events:{"click .delete":function(a){a.preventDefault();var b="#details-modal-"+this.model.get("key"),a="Are you sure you want to perminantly delete ";a+=this.model.get("title");
a+="?";confirm(a)&&($(b).modal("hide"),this.model.destroy(),this.remove())},"click .read":function(){this.model.openInReader()}}});
Readium.Views.LibraryItemsView=Backbone.View.extend({tagName:"div",id:"library-items-container",className:"row-view clearfix",initialize:function(){this.template=Handlebars.templates.library_items_template;this.collection.bind("reset",this.render,this);this.collection.bind("add",this.addOne,this)},render:function(){var a=this.collection,b=$(this.el);b.html(this.template({}));this.$("#empty-message").toggle(this.collection.isEmpty());a.each(function(c){c=new Readium.Views.LibraryItemView({model:c,
collection:a,id:c.get("id")});b.append(c.render().el)});$("#library-books-list").html(this.el);return this},addOne:function(a){a=new LibraryItemView({model:a,collection:this.collection,id:a.get("id")});this.$("#empty-message").toggle(!1);$(this.el).append(a.render().el)},events:{}});
Readium.Views.ExtractItemView=Backbone.View.extend({el:$("#progress-container")[0],initialize:function(){this.template=Handlebars.templates.extracting_item_template;this.model.bind("change",this.render,this);this.model.bind("change:error",this.extractionFailed,this)},render:function(){var a=$(this.el);this.model.get("extracting")?(a.html(this.template(this.model.toJSON())),a.show("slow")):a.hide("slow");return this},extractionFailed:function(){alert(this.model.get("error"));this.model.set("extracting",
!1)}});
Readium.Views.ReadiumOptionsView=Backbone.View.extend({el:"#readium-options-modal",initialize:function(){this.model.on("change",this.render,this);this.render()},render:function(){var a=this.model;this.$("#paginate_everything").prop("checked",a.get("paginate_everything"));this.$("#verbose_unpacking").prop("checked",a.get("verbose_unpacking"));this.$("#hijack_epub_urls").prop("checked",a.get("hijack_epub_urls"))},events:{"change #verbose_unpacking":"updateSettings","change #hijack_epub_urls":"updateSettings","change #paginate_everything":"updateSettings",
"click #save-settings-btn":"save"},updateSettings:function(){var a=this.$("#hijack_epub_urls").prop("checked"),b=this.$("#verbose_unpacking").prop("checked"),c=this.$("#paginate_everything").prop("checked");this.model.set({verbose_unpacking:b,hijack_epub_urls:a,paginate_everything:c})},save:function(){this.model.save();this.$el.modal("hide")}});
Readium.Routers.ApplicationRouter=Backbone.Router.extend({initialize:function(a){this.collection=a.collection},routes:{"view_book/:id":"openBook","":"showLibrary"},openBook:function(a){this.showViewer();a=this.collection.get(a).toJSON();a.fixed_layout?(console.log("initializing fixed layout book"),window._book=new Readium.Models.AppleFixedEbook(a)):(console.log("initializing reflowable book"),window._book=new Readium.Models.ReflowableEbook(a));window._libraryView=new Readium.Views.ViewerApplicationView({model:window._book});
window._libraryView.render()},showLibrary:function(){$("#readium-library-activity").toggle(!0);$("#readium-viewer-activity").toggle(!1)},showViewer:function(){$("#readium-library-activity").toggle(!1);$("#readium-viewer-activity").toggle(!0)},splat_handler:function(a){console.log(a)}});