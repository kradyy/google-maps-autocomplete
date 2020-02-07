function initMap() {
    searchBox = new google.maps.places.AutocompleteService();
    var selector = $("#pac-input");
    var results_container = $('<div class="results-container"><ul></ul></div>');

    selector.after(results_container);

    $(document).on("click", ".results-container ul li", function() {
        var location = $(this).text();
        selector.val(location);
        $(".results-container").hide();
    });

    // Custom Autocomplete with debounce()
    selector.on(
        "input",
        debounce(function(e) {
            if (selector.val().length < 2) {
                $(".results-container").hide();
                return;
            }

            if ($(this).val()) {
                searchBox.getPlacePredictions(
                    {
                        types: ["geocode"],
                        input: selector.val(),
                        componentRestrictions: {
                            country: "se"
                        }
                    },
                    searchBoxCallback
                );
            }

            // debounce the call with a delay
        }, 1500)
    );

    selector.on("focusout", function() {
        setTimeout(() => {
            $(".results-container").hide();
        }, 200);
    });

    selector.on("keyup", function(e) {
        // 40 = down
        // 38 = up
        // 331 = enter

        if (e.keyCode != 40 && e.keyCode != 38) return;

        if ($(".results-container ul").children().length > 0) {
            var getPos = $(".results-container ul li.selected").index();
            $(".results-container ul li").removeClass("selected");

            if (getPos === -1) {
                $(".results-container ul li")
                    .eq(0)
                    .addClass("selected");
            } else {
                var step = e.keyCode == 40 ? getPos + 1 : getPos - 1;
                var item = $(".results-container ul li").eq(step);

                item.addClass("selected");
                $(this).val(item.text());
            }
        }
    });

    // underscorejs debounce
    function debounce(func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function() {
            var last = Date.now() - timestamp;

            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function() {
            context = this;
            args = arguments;
            timestamp = Date.now();
            var callNow = immediate && !timeout;
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    }

    function searchBoxCallback(predictions, status) {
        if (!predictions) return;

        var results = "";

        var input = $("#pac-input").val();
        var ul_container = $(".search-box .results-container ul");

        predictions.forEach(function(prediction) {
            var str = prediction.description.replace(
                new RegExp(input, "gi"),
                match => {
                    return `<strong>${match}</strong>`;
                }
            );

            results += `<li class="place">${str}</li>`;
        });

        $(".results-container").show();

        ul_container.html(results);
    }
}

initMap();