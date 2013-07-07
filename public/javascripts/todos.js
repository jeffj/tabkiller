var holder = window//document.getElementById('holder');
holder.ondragover = function () { this.className = 'hover'; return false; };
holder.ondragend = function () { this.className = ''; return false; };
holder.ondrop = function (e) { e.preventDefault(); return false; };


$(function ($, _, Backbone) {

  "use strict";

  var Post, Block, PostList, BlockList, Posts, Blocks, PostView, BlockView, AppView, App;

  // Post Model
  // ----------

  // Our basic **post** model has `title`, `order`, and `done` attributes.
  Post = Backbone.Model.extend({

    // MongoDB uses _id as default primary key
    idAttribute: "_id",

    // Default attributes for the todo item.
    defaults: function () {
      return {
          title: ""
        , block: null
        , done: false
        , url : ""
        , createdAt:new Date()
        , favicon: ""
        , blockid : null
        , blocktitle : "add title here..."
        , blockUserName: null
        , OtherBookmarkBlocks: []
      };
    },

    // Ensure that each todo created has `title`.
    initialize: function () {
      if (!this.get("title")) {
        this.set({"title": this.defaults.title});
      }
    },
    // timeago:function(){
    // },
    // Remove this Todo and delete its view.
    clear: function () {
      this.destroy();
    }
  });

  Block = Backbone.Model.extend({

      idAttribute: "_id",
    //  sync: function () { return false; }
    defaults: function () {
      return {
          title: ""
          , username:""
      };
    },

  })

  // Todo Collection
  // ---------------

  PostList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Post,
    // Note that url may also be defined as a function.
    url: function () {
       var val ="/bookmark" 
        val +=((this.id) ? '/' + this.id : '');

      return  val;
      // + ((this.id) ? '/' + this.id : '');
    },

  });

  // Create our global collection of **Todos**.
  Posts = new PostList();

    // Reference to this collection's model.
  BlockList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Block,
    // Note that url may also be defined as a function.
    url: function () {
      return "/block"+ ((this.id) ? '/' + this.id : '');
    },
  });

  // Create our global collection of **Todos**.
  Blocks = new BlockList();




  // Todo Item View
  // --------------
  BlockView = Backbone.View.extend({
    tagName:  "li",
    template: _.template($('#block-template').html()),

    events: {
       "click .bucket-select" : "bucketSelect",
        "click .edit" : "edit",
        "click .update" : "update",

    },
    update: function () {

      this.model.save({title: this.$(".new-title").val()});
      this.$el.removeClass("editing-block")
      this.$(".block-title").html(this.model.toJSON().title )


    },
    edit: function () {
      this.$el.addClass("editing-block")
      this.$(".new-title").val( this.model.toJSON().title )
    },    
    render: function () {
      this.$el.html(this.template( this.model.toJSON() ));
      var that=this;
      this.$el.bind("dragover", function(){ 
        if (!that.$el.hasClass("selected-bucket")) that.$(".bucket-select").click();
      });
      return this;


    },
    bucketSelect:function(){
      $("#new-post-block").val(this.model.get("_id"))
      $(".selected-bucket").removeClass("selected-bucket")
      this.$el.addClass("selected-bucket");
    }

  });

  // The DOM element for a todo item...
  PostView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
       "click .toggle"   : "toggleDone",
       "click .edit"  : "edit",
       "click a.destroy" : "clear",
       "click .submit-update"  : "update",
      // "click .menu" : "menu"
    },
    // menu:function(e){
    //   var that=this;
    //   that.flag=false;
    //   this.dropdown.css({"display":"inline-block", "position":"absolute","left":$(event.target).position().left, "top":$(event.target).position().top+$(event.target).height()})
    //   $(window).bind("click", function(){
    //     if (that.flag==false) { that.flag=true; return false }

    //     that.dropdown.css({"display":"none"})
    //     $(this).unbind("click");
    //   })
    // },
    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Todo** and a **TodoView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function () {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

    // Re-render the titles of the todo item.
    render: function () {



            // , _id : String(Math.random()*100000000000000000)

      var JSON=this.model.toJSON()
      if (!JSON._id) JSON._id=String(Math.random()*100000000000000000)
      JSON.timeAgo=$.timeago(this.model.get("createdAt"))
      this.$el.html(this.template(JSON));
      this.input = this.$('.edit');
      this.bodyEdit = this.$(".title-edit")
      this.titleEdit = this.$(".body-edit")
      this.dropdown=this.$(".dropdown")
      this.menu=this.$(".menu")



      //this.controlBox.dropdown('method', );
      return this;
    },

    // Toggle the `"done"` state of the model.
    toggleDone: function () {
      this.model.toggle();
    },
    // If you hit `enter`, we're through editing the item.
    update: function (e) {
        var valuebody = this.bodyEdit.val().trim(),
            valuetitle = this.titleEdit.val().trim();
        if(valuetitle || valuebody) {
          this.model.save({title: valuetitle, body:valuebody});
        }
        this.$el.removeClass('editing');
      // if (e.keyCode === 13) {
      //   this.close();
      // }
    },
    // Remove the item, destroy the model.
    clear: function () {
      this.model.clear();
    },
    edit:function () {
      this.$el.addClass("editing")
      this.titleEdit.val(this.model.get("title"));
      this.bodyEdit.val(this.model.get("body"))
    },

  });

  // The Application
  // ---------------



  // Our overall **AppView** is the top-level piece of UI.
  AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#app"),
    username:username,
    // Our template for the line of statistics at the bottom of the app.

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-post-title":  "createOnEnter",
     // "click #clear-completed": "clearCompleted",
      //"click #toggle-all": "toggleAllComplete"
      "click .submit"  : "create"

    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos.
    initialize: function () {
      this.inputTitle = this.$("#new-post-title");
      this.inputBody = this.$("#new-post-body");
      this.inputUrl = this.$("#new-post-url");
      this.inputBlock = this.$("#new-post-block");

    //  Blocks.bind('add', this.addBlock, this);
      Posts.bind('add', this.addOne, this);
      Posts.bind('reset', this.addAll, this);
      Posts.bind('all', this.render, this);
      //this.footer = this.$('footer');
      this.main = $('#main');
      $(window).on("drop")
      $("#new-bucket-link").bind("click",this.newBucket)


       var params={};
       if (block) params.block = block;  //move these to absolute paths
       if (home) params.home = home;
       if (userId) params.userId = userId;
         // val += ((home) ? '?home=' + true : '');//move these to absolute paths
      Posts.fetch({data: params });
    },
    newBucket:function(){ 
        $("#new-post-block").val("")
        $(".selected-bucket").removeClass("selected-bucket")
        $("#new-bucket").addClass("selected-bucket")
    },
    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function () {
      if (Posts.length) {
        this.main.show();
        //this.footer.show();
      } else {
        this.main.hide();
      }
    },

    // Add a single post item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function (post) {
      var view, block; 
      view = new PostView({model: post});
      block=App.findBlock( {title: post.get("blocktitle"), _id:post.get("blockid"), username:post.get("blockUserName")} )

      $("ul.block-view",block).prepend(view.render().el);
      $("#list").prepend(block) //view.render().el);//.
      $(".block-link", block).click();//click the new bucket to focus it.

    },
    findBlock: function(block){
      var view,el, id;

      id=Blocks.where({_id:block._id})

      if (id.length)
        el=id[0].el //.get("el");
      else
        el=this.addBlock(block);
      return el      
    },


    addBlock: function(block){
      var blockModel = new Block({_id: (block)? block._id : null ,title: (block)? block.title : null,  username: (block)? block.username : null});
      var blockview= new BlockView({model:blockModel});
      var render=blockview.render().el;
      blockModel.el=render  //.set({el:render});
    //  block.save();
      Blocks.add(blockModel);
      return render
    },

    // Add all items in the **Todos** collection at once.
    addAll: function () {
      Posts.each(this.addOne);
    },

    // If you hit return in the main input field, create new **Todo** model
    createOnEnter: function (e) {
      if (e.keyCode !== 13) { return; }
      if (!this.inputTitle.val()) { return; }
      create();
    },
    create:function(){
      var blockVal;
      if (this.inputBlock.val()) blockVal=this.inputBlock.val(); else blockVal=null;
      Posts.create({
            title: this.inputUrl.val()
          , body: this.inputBody.val()
          , myPost: true
          , url: this.inputUrl.val()
          , user: {username:this.username}
          , block : blockVal
          , blockid : blockVal
          , totalBookmarks : 1

        });
      this.inputUrl.val("")
    }
    // toggleAllComplete: function () {
    //   var done = this.allCheckbox.checked;
    //   Posts.each(function (post) { post.save({'done': done}); });
    // }

  });


  // Finally, we kick things off by creating the **App**.
  App = new AppView();

  $("#top").bind("dragover", App.newBucket);

  $(window).on("drop", function(e){
    var text=e.originalEvent.dataTransfer.getData('Text');
    if (text)
    $("#new-post-url").val(text),
    App.create();

  });

}(jQuery, _, Backbone));