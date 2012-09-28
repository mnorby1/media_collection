window.HeaderView = Backbone.View.extend({
    initialize:function(){
      _.bindAll(this,'render');  
    },
        tagName:"div",
        className:"navbar navbar-fixed-top",
        template : _.template($("#template-header").html()),
    
    render:function(){
        console.log("Rendering the header");
        $(this.el).html(this.template());
        return this;
    }
});
window.MovieListView = Backbone.View.extend({
    tagName:"ul",
    className:"nav nav-pills nav-stacked",
    initialize:function(){
        _.bindAll(this,'render');
        App.Collections.movies.bind("add",this.render,this);
        App.Collections.movies.bind("reset",this.render,this);
        App.Collections.movies.bind("remove",this.render,this);
    },
    events:{
        "click .sortMovieList":"sortMovieList",
        "click .showAdvancedSortOptions":"showAdvancedSortOptions",
        "click .advancedSort":"advancedSort",
        "click .removeFilter":"removeFilter"
    },
    showAdvancedSortOptions:function(){
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
    },
    render:function(){
        var $ul = this.el;
        $($ul).empty();
        var $sortOptions = $($ul).append('<div id="sortOptions"></div>');
        $sortOptions.append('<button class="sortMovieList" name="asc"><img src="img/sort-acend.png" alt="a to z"></img></button> ');
        $sortOptions.append('<button class="sortMovieList" name="dec"><img src="img/sort-decend.png" alt="z to a"></img></button> ');
        $sortOptions.append('<button class="showAdvancedSortOptions"><img src="img/options_advanced.png" alt="advanced"></img></button> '); 
        $sortOptions.append('<button class="removeFilter"><img src="img/filter-remove.png" alt="remove filter"></img></button> ');
        $sortOptions.append('<input type="text"class="search-query typeahead" placeholder="Search..." data-provide="typeahead">');
        this.collection.each(function(model){
            $($ul).append(new window.MovieItemView({model:model}).render().el);
        });
        $(".typeahead").typeahead({
            source:Array("alpha","beta","kappa")
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