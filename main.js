var MediaRouter = Backbone.Router.extend({
    initialize:function(){
        console.log("The router is init.");
        /*************
         * Renders the header when router is initialized. So its always here.
         */
        App.Views.headerView = new HeaderView();
        $(".header").html(App.Views.headerView.render().el);
    },
    routes: {
        "": "home",
        "movies":"movieList",
        "movies/:movie":"movieDetails"
    },
    home: function(){
        console.log("Initilizing home");
        /*************
         * Remove the active class from all elements in header. Add it to the 
         * correct one.
         */
        $(".fc_header").removeClass("active");
        $("#fc_home").addClass("active");
        $("#leftbar").html("");
        $("#content").html("");
    },
    movieList:function()
    {
        console.log("Routing for movie display");
        /*************
         * Remove the active class from all elements in header. Add it to the 
         * correct one.
         */
        $(".fc_header").removeClass("active");
        $("#fc_movies").addClass("active");
        App.Collections.movies = new window.Movies();
        App.Collections.movies.fetch({
            success:function(){
                App.Views.movieListMasterView = new MovieListMasterView({collection:App.Collections.movies});
                App.Views.movieDetailView = new MovieDetailView({model:new Movie(),collection:App.Collections.movies});
                $("#leftbar").html(App.Views.movieListMasterView.render().el);
                $("#content").html(App.Views.movieDetailView.render().el);
            },
            error:function(){
                console.log("There was an error retrieving the movie list data");
            }
        });    
    },
    movieDetails:function(movie){
        var currentModel = App.Collections.movies.get(movie);
        App.Views.movieDetailView = new MovieDetailView({model:currentModel});
        $("#content").html(App.Views.movieDetailView.render().el);
    }
});
/*************
 * Waits for the document to be ready then creates a new router and starts backbone
 */
$(document).ready(function(){
    //var mediaRouter = new MediaRouter;
    $('#primaryModal').modal({show:false});
    App.Routers.mediaRouter = new MediaRouter;
    Backbone.history.start();
});