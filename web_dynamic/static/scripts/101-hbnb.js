$("document").ready(function () {
  const api = "http://" + window.location.hostname;

  $.get(api + ":5001:/api/v1/status/", function (response) {
    if (response.status === "OK") {
      $("div#api_status").addClass("available");
    } else {
      $("div#api_status").removeClass("available");
    }
  });

  $.ajax({
    url: api + ":5001/api/v1/places_search/",
    type: "POST",
    data: "{}",
    contentType: "application/json",
    dataType: "json",
    success: appendPlaces,
  });

  let states = {};
  $('.locations > ul > h2 > input[type="checkbox"]').change(function () {
    if ($(this).is(":checked")) {
      states[$(this).attr("data-id")] = $(this).attr("data-name");
    } else {
      delete states[$(this).attr("data-id")];
    }
    const locations = Object.assign({}, states, cities);
    if (Object.values(locations).length === 0) {
      $(".locations H4").html("&nbsp;");
    } else {
      $(".locations H4").text(Object.values(locations).join(", "));
    }
  });

  let cities = {};
  $('.locations > ul > ul > LI input[type="checkbox"]').change(function () {
    if ($(this).is(":checked")) {
      cities[$(this).attr("data-id")] = $(this).attr("data-name");
    } else {
      delete cities[$(this).attr("data-id")];
    }
    const locations = Object.assign({}, states, cities);
    if (Object.values(locations).length === 0) {
      $(".locations H4").html("&nbsp;");
    } else {
      $(".locations H4").text(Object.values(locations).join(", "));
    }
  });

  let amenities = {};
  $('.amenities input[type="checkbox"]').change(function () {
    if ($(this).is(":checked")) {
      amenities[$(this).attr("data-id")] = $(this).attr("data-name");
    } else {
      delete amenities[$(this).attr("data-id")];
    }
    if (Object.values(amenities).length === 0) {
      $(".amenities H4").html("&nbsp;");
    } else {
      $(".amenities H4").text(Object.values(amenities).join(", "));
    }
  });

  $("BUTTON").click(function () {
    $.ajax({
      url: api + ":5001/api/v1/places_search/",
      type: "POST",
      data: JSON.stringify({
        states: Object.keys(states),
        cities: Object.keys(cities),
        amenities: Object.keys(amenities),
      }),
      contentType: "application/json",
      dataType: "json",
      success: appendPlaces,
    });
  });
});

function appendPlaces(data) {
  $("section.places").empty();
  data.map((place) => {
    $("section.places").append(
      `<article>
		<div class="title">
                <h2>${place.name}</h2>
                  <div class="price_by_night">
                    ${place.price_by_night}
                  </div>
                </div>
                <div class="information">
                  <div class="max_guest">
                    <I class="fa fa-users fa-3x" aria-hidden="true"></I>
                    </br>
                    ${place.max_guest} Guests
                  </div>
                  <div class="number_rooms">
                    <I class="fa fa-bed fa-3x" aria-hidden="true"></I>
                    </br>
                    ${place.number_rooms} Bedrooms
                  </div>
                  <div class="number_bathrooms">
                    <I class="fa fa-bath fa-3x" aria-hidden="true"></I>
                    </br>
                    ${place.number_bathrooms} Bathrooms
                  </div>
                </div>
                <div class="description">
                  ${place.description}
                </div>
              </article>`
    );
    getReviews(place.id);
  });
}

function getReviews(placeId) {
  const HOST = "http://127.0.0.1:5001";

  $.getJSON(`${HOST}/api/v1/places/${placeId}/reviews`, function (data) {
    const reviewsHeader = $(`.reviews[data-place="${placeId}"] h2`);
    reviewsHeader.html(
      `${data.length} Reviews <span id="toggle_review">show</span>`
    );
    reviewsHeader.find("#toggle_review").on("click", { placeId }, function (e) {
      const reviewsList = $(`.reviews[data-place="${e.data.placeId}"] ul`);
      if (reviewsList.css("display") === "none") {
        reviewsList.css("display", "block");
        data.forEach((review) => {
          $.getJSON(`${HOST}/api/v1/users/${review.user_id}`, (user) => {
            reviewsList.append(`
	    <li>
	    <h3>
	    From ${user.first_name} ${user.last_name} the ${review.created_at}
	    </h3>
	    <p>${review.text}</p>
	    </li>
		    `);
          });
        });
      } else {
        reviewsList.css("display", "none");
      }
    });
  });
}

