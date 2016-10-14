$(document).ready(function(){

    var rootUrl = 'http://localhost:3000';
    var btnTranslate = $("#btnTranslate");

    // translate button click function
    btnTranslate.click(function() {

        // set variables for from inputs
        var inputLangFrom = $('#langFrom');
        var inputLangTo = $('#langTo');
        var inputTextFrom = $('#textFrom');
        var inputTextTo = $('#textTo');


        if(inputTextFrom.val().trim() == ""){
            return false;
        }else if(inputLangFrom.val() == inputLangTo.val()){
            // to check if translating to the same language
            return false;
        }else{
            // disable the translate button temporary
            btnTranslate.attr('disabled','disabled');

            // array to store from data inside from html elements
            var formDate = {
                'langFrom' : inputLangFrom.val(),
                'langTo'   : inputLangTo.val(),
                'textFrom' : inputTextFrom.val(),
                'textTo'   : inputTextTo.val()
            };

            // ajax call to node web service
            $.ajax({
                type: 'POST',
                url: rootUrl + '/translate',
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(formDate),
                success: function(data, textStatus){
                    // status returned from web service
                    console.log(data);
                    if(data.status == "0000"){
                        // simple checking to put data properly in textboxes
                        if(data.data.langTo == inputLangTo.val()){
                            inputTextTo.val(data.data.textTo);
                            inputTextFrom.val(data.data.textFrom);
                        }else{
                            inputTextTo.val(data.data.textFrom);
                            inputTextFrom.val(data.data.textTo);
                        }

                    }else{
                        // error handling can be implemented for other status values
                        alert('Something went wrong!');
                    }
                    // enable translate button
                    btnTranslate.removeAttr('disabled');
                },
                error: function(textStatus){
                    alert('ERROR : ' + textStatus.status +' - '+ textStatus.statusText);
                }
            });
        }
    });

});
