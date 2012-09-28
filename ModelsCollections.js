window.Movie = Backbone.Model.extend({
    defaults:{
        title:null,
        year:null,
        director:null,
        actors:[],
        actresses:[],
        notes:null,
        plot:null,
        procuctionCo:null,
        writer:null,
        genre:null,
        esrb:null,
        runtime:null,
        quotes:[],
        stars:1
    },
    events:{
      "change":function(){console.log("Item changed")},
      "add":function(){console.log("Item added")}
    },
});

window.MovieLibrary = window.Movie.extend({
    
});

window.Movies = Backbone.Collection.extend({
    model:Movie,
    localStorage: new Store("mediatracker-backbone"),
    sortStrategies:{
        dec:function(model){
            var str = model.get("title");
            str = str.toLowerCase();
            str = str.split("");
            str = _.map(str, function(letter) { 
                return String.fromCharCode(-(letter.charCodeAt(0)));
            });
            return str;
        },
        asc:function(model){
            return model.get("title");
        }
    },
    comparator:function(model){
        return model.get("title");
    },
    sortMovieList:function(sortType){
        this.comparator = this.sortStrategies[sortType];
        this.sort();
    }
});