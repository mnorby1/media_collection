window.utils = {
    injectModal:function(element,heading,body,footer){
        var handle = $(element).append($("#modalBox").html());
        $(".modal-header").html(heading);
        $(".modal-body").html(body);
        $(".modal-footer").html(footer);
        $(handle).on('hidden', function () {
           $("#primaryModal").remove();
        });
    },
    test:function(whatToLog){
        console.log(whatToLog);
    }
};