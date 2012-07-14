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
    events:{
      "change":function(){console.log("Item changed2")},
      "add":function(){console.log("Item added2")}
    },
});

window.Movies = Backbone.Collection.extend({
    model:Movie,
    localStorage: new Store("mediatracker-backbone")
});