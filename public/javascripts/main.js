$(document).ready(function(){

    // translate button click function
    $("#btnTranslate").click(function() {
        if($('#textFrom').val().trim() == ""){
            return false;
        }else if($('#langFrom').val() == $('#langTo').val()){
            // to check if translating to the same language
            return false;
        }else{
            // disbale the translate button temporary
            $("#btnTranslate").attr('disabled','disabled');

            // array to store from data inside from html elements
            var formDate = {};
            formDate['from'] = $('#langFrom').val();
            formDate['to'] = $('#langTo').val();
            formDate['lang'] = formDate['from']+'-'+formDate['to'];
            formDate['textFrom'] = $('#textFrom').val();
            formDate['textTo'] = $('#textTo').val();

            // first ajax call to check if relevant data exists in the local db
            $.ajax({
                type: 'POST',
                url: hostUrl + '/search',
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(formDate),
                success: function(data, textStatus){
                    if(data.status == "0000"){
                        console.log("result found in local db");

                        // small checking to see if stored data have the same sequence and user input.
                        // if it is not replace the value of text field. to be improved.
                        if(data.data.lang == formDate['lang']){
                            $('#textTo').val(data.data.textTo);
                            $('#textFrom').val(data.data.textFrom);
                        }else{
                            $('#textTo').val(data.data.textFrom);
                            $('#textFrom').val(data.data.textTo);
                        }

                        // re enabling the translate button.
                        $("#btnTranslate").removeAttr('disabled');

                    }else{
                        // no result found in local database, need to call yendex api and store result in db
                        console.log("no result from local db");

                        // ajax call to yendex apis
                        $.ajax({
                            type: 'POST',
                            url: yendexUrl+'?lang='+formDate['lang']+'&key='+yendexKey,
                            dataType: "json",
                            contentType: "application/x-www-form-urlencoded",
                            data: "text="+formDate['textFrom'],
                            success: function(data, textStatus){
                                $('#textTo').val(data.text[0]);
                                formDate['textTo'] = data.text[0];

                                // the data is fetched successfully from yendex server
                                // now need to store in local db
                                $.ajax({
                                    type: 'POST',
                                    url: hostUrl + '/store',
                                    dataType: "json",
                                    contentType: "application/json",
                                    data: JSON.stringify(formDate),
                                    success: function(data, textStatus){
                                        if(data.status == "0000"){
                                            console.log("data inserted to local db successfully");
                                        }else{
                                            console.log("there was a problem storing in local db");
                                        }
                                        $("#btnTranslate").removeAttr('disabled');
                                    },
                                    error: function(textStatus){
                                        $("#btnTranslate").removeAttr('disabled');
                                        alert('error');
                                    }
                                });
                            },
                            error: function(textStatus){
                                $("#btnTranslate").removeAttr('disabled');
                                alert('error');
                            }
                        });
                    }
                },
                error: function(textStatus){
                    $("#btnTranslate").removeAttr('disabled');
                    alert('error');
                }
            });
        }
    });

});
