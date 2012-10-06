window.HeaderView = Backbone.View.extend({
    initialize:function(){
      _.bindAll(this,'render');  
    },
        tagName:"div",
        className:"navbar navbar-fixed-top",
        template : _.template($("#template-header").html()),
    
    render:function(){
        $(this.el).html(this.template());
        return this;
    }
});
window.MovieListMasterView = Backbone.View.extend({
    tagName:"div",
    initialize:function(){
        _.bindAll(this,'render');
    },
    events:{
        "click .pager":"changePage"
    },
    changePage:function(event){
        event.preventDefault();
        var direction = $(event.target.parentElement).attr('data-direction');
        this.collection.trigger("pageinate",direction);
    },
    render:function(){
        this.SubViews = {};
        this.SubViews.searchView = new window.MovieListSearchView({collection:this.collection});
        this.SubViews.listView = new window.MovieListView({collection:this.collection});
        $(this.el).append(this.SubViews.searchView.render().el);
        $(this.el).append(this.SubViews.listView.render().el);
        $(this.el).append(_.template($("#template-pagination-controls").html()));
        return this;
    }
});
window.MovieListSearchView = Backbone.View.extend({
    tagName:"div",
    initialize:function(){
        _.bindAll(this,'render');
        this.template = _.template($("#template-movie-list-search").html());
    },
    events:{
        "click .sortMovieList":"sortMovieList",
        "click .showAdvancedSortOptions":"showAdvancedSortOptions",
        "click .advancedSort":"advancedSort",
        "click .removeFilter":"removeFilter",
        "keyup .search-query":"searchBarFilter"
    },
    searchBarFilter:function(event){
        if(this.isCharHandled(event)){
            var query = event.currentTarget.value;
            var newCollection=[];
            query = query.toLowerCase();
            query = query.split(",");
            _.each(query,function(searchValue){
                App.Collections.movies.fetch({trigger:false});
                var key = searchValue.substring(0,searchValue.indexOf(":"));
                var searchString = searchValue.substring(searchValue.indexOf(":")+1);
                var validKeys = _.keys(App.Collections.movies.models[0].attributes);
                if(validKeys.indexOf(key) < 0){
                    key = "title";
                }
                newCollection = _.union(newCollection,App.Collections.movies.filter(function(movie){
                        return movie.get(key).toString().toLowerCase().indexOf(searchString) >= 0;
                    }));
            });
            this.collection.reset(newCollection);
        }
    },
    isCharHandled:function(evt){
        if (typeof evt.which == "undefined") {
            return true;
        } 
        else if (typeof evt.which == "number" && evt.which > 0) {
            return !evt.ctrlKey && !evt.metaKey && !evt.altKey 
                && evt.which != 16;
        }
        return false;   
    },
    render:function(){
        $(this.el).html(this.template());
        return this;
    },
    showAdvancedSortOptions:function(){//TODO: turn this into a view
        var header = "<h3>Advanced movie sorting options</h3>";
        var body = _.template($("#movie-list-filter-body").html(),{"model":"value to set"});
        var footer = '<a href="#" class="btn" data-dismiss="modal">Close</a>'+
                     '<button type="button" class="btn btn-primary advancedSort">Sort</button>';
        utils.injectModal(this.$el,header,body,footer);
        $("#primaryModal").modal("toggle");
    },
    advancedSort:function(){
        var testVal = $("#testing").val();
        console.log("the extracted value is: ",testVal);
        this.collection.models = this.collection.filter(function(movie){
            return movie.get("stars") <= "3";
        });
        $("#primaryModal").modal("toggle");
        this.render();
    },
    sortMovieList:function(event){
        var sortType = $(event.currentTarget.attributes.name).val();
        this.collection.sortMovieList(sortType);
    },
    removeFilter:function(){
        App.Collections.movies.fetch();
        App.Collections.movies.trigger("test");
        $(".search-query").val("");
    },
});
window.MovieListView = Backbone.View.extend({
    tagName:"ul",
    className:"nav nav-pills nav-stacked",
    initialize:function(){
        _.bindAll(this,'render');
        App.Collections.movies.bind("add",this.render,this);
        App.Collections.movies.bind("reset",this.resetCollection,this);
        App.Collections.movies.bind("remove",this.render,this);
        App.Collections.movies.bind("change",this.render,this);
        App.Collections.movies.bind("pageinate",this.paginate,this);
        this.recordsPerPage = 10;
        this.currentPage = 0;
        this.lastPage = 0;
    },
    events:{
        
    },
    paginate:function(direction){
        switch(direction){
            case 'forward':
                this.currentPage++;
                if(this.currentPage > this.lastPage)
                    this.currentPage = 0;
                break;
            case 'back':
                this.currentPage--;
                if(this.currentPage < 0)
                    this.currentPage = this.lastPage;
                break;
        }
        this.render();
    },
    resetCollection:function(){
        this.currentPage = 0;
        this.render();
    },
    render:function(){
        var $ul = this.el;
        $($ul).empty();
        var start = this.recordsPerPage * this.currentPage;
        var end = start + this.recordsPerPage;
        var tmpCollection = _.clone(this.collection);
        tmpCollection.models = tmpCollection.models.slice(start,end);
        this.lastPage = Math.floor(tmpCollection.length / this.recordsPerPage);
        tmpCollection.each(function(model){
            $($ul).append(new window.MovieItemView({model:model}).render().el);
        });
        return this;
    },
});
window.MovieItemView = Backbone.View.extend({
    tagName:"li",
    className:"",
    events:{
      "click .movieListItem":"changeActive"
    },
    initialize:function(){
        _.bindAll(this,'render');
        //App.Collections.movies.on("removeActive","removeActive");
        this.bind("removeActive",this.removeActive,this);
        this.template = _.template($("#template-movie-item").html());
        //console.log("template init: ",$("#template-movie-item").html());
    },
    render:function(){
        $(this.el).html(this.template({model:this.model.toJSON()}));
        return this;
    },
    changeActive:function(){
        console.log("Changing the active state");
        $(".movieListItem").parent().removeClass("active");
        App.Collections.movies.trigger("removeActive");
        $(this.el).addClass("active");
    },
    removeActive:function(){
        $(this.el).removeClass("active");
    }
});
window.MovieDetailView = Backbone.View.extend({
    tagName:"div",
    events:{
      "click .addEditContent":"displayAddEditForm",
      "click .save":"saveMovie",
      "click .remove":"removeMovie",
      "click .starRating":"changeStarRating",
      "click .addActorField":"addActorField",
      "click .removeActorField":"removeActorField",
      "click .addActressField":"addActressField",
      "click .removeActressField":"removeActressField"
    },
    initialize:function(){
        _.bindAll(this,'render');
    },
    render:function(){
        this.template = _.template($("#template-movie-details").html());
        var isNew = this.model.isNew();
        $(this.el).html(this.template({model:this.model.toJSON(),isNew:isNew}));
        return this;
    },
    displayAddEditForm:function(){
        if($(".addEditContent").hasClass("btn-primary")){
            $(".addEditContent").removeClass("btn-primary");
            $(".addEditContent").addClass("btn-warning");
            $(".editContent").removeClass("hiddenContent");
            $(".displayContent").addClass("hiddenContent");
        }
        else{
            $(".addEditContent").removeClass("btn-warning");
            $(".addEditContent").addClass("btn-primary");
            $(".editContent").addClass("hiddenContent");
            $(".displayContent").removeClass("hiddenContent");
        }
    },
    saveMovie:function(){
        var actorsArray = [];
        $(".actors").children('input').each(function(){
            actorsArray.push($(this).val());
        });
        var actressArray = [];
        $(".actresses").children('input').each(function(){
            actressArray.push($(this).val());
        });
        this.model.set({
            title:$("#titleInput").val(),
            year:$("#yearInput").val(),
            director:$("#directorInput").val(),
            actors:actorsArray,
            actresses:actressArray,
            genre:$("#genreInput").val()
        });
        console.log("Save model:",this.model);
        App.Collections.movies.add(this.model);
        this.model.save();
        App.Routers.mediaRouter.navigate("#movies",{trigger:true});
        this.render();
    },
    removeMovie:function(){
      var yes = confirm("Are you sure you want to remove this movie? This action is irreversable.");
      if(yes){
          this.model.destroy();
          App.Collections.movies.remove(this.model);
          App.Routers.mediaRouter.navigate("#movies",{trigger:true});
      }
    },
    changeStarRating:function(event){
        var $clickedStar = $(event.currentTarget);
        var value = $clickedStar.attr("rating");
        this.model.set({stars:value});
        this.changeStarVisual(value);
    },
    changeStarVisual:function(starRating){
        $(".starControl").children('img').each(function(index){
            if(index+1 <= starRating){
                $(this).attr('src',"img/star-gold16.png");
            }
            else{
                $(this).attr('src',"img/star-white16.png");
            }
        });
    },
    addActorField:function(){
        var $currentIcon = $(".actors").children(".addActorField").children('img');
        $(".actors").children(".removeActorField").remove();
        $(".actors").children(".addActorField").addClass("removeActorField");
        $(".actors").children(".removeActorField").removeClass("addActorField");
        $($currentIcon).attr('src',"img/minus-white.png");
        $(".actors").append('<br><input type="text" class="input-xlarge actor">' + 
            '<span class="addActorField"><img src="img/plus-white.png"</span>');
    },
    removeActorField:function(){
        $(".actors input:last").remove();
        $(".actors br:last").remove();
        $(".actors span").remove();
        $(".actors").children('input').each(function(){
            $(".actors").children(".removeActorField").remove();
            $(".addActorField").addClass("removeActorField");
            $(".removeActorField").removeClass("addActorField");
            $(".removeActorField").children('img').attr('src',"img/minus-white.png");
            $(this).after('<span class="addActorField"><img src="img/plus-white.png"</span>');
            console.log(this);
        });
    },
    addActressField:function(){
        var $currentIcon = $(".actresses").children(".addActressField").children('img');
        $(".actresses").children(".removeActressField").remove();
        $(".actresses").children(".addActressField").addClass("removeActressField");
        $(".actresses").children(".removeActressField").removeClass("addActressField");
        $($currentIcon).attr('src',"img/minus-white.png");
        $(".actresses").append('<br><input type="text" class="input-xlarge actresss">' + 
            '<span class="addActressField"><img src="img/plus-white.png"</span>');
    },
    removeActressField:function(){
        $(".actresses input:last").remove();
        $(".actresses br:last").remove();
        $(".actresses span").remove();
        $(".actresses").children('input').each(function(){
            $(".actresses").children(".removeActressField").remove();
            $(".addActressField").addClass("removeActressField");
            $(".removeActressField").removeClass("addActressField");
            $(".removeActressField").children('img').attr('src',"img/minus-white.png");
            $(this).after('<span class="addActressField"><img src="img/plus-white.png"</span>');
            console.log(this);
        });
    }
});