var eventsTemplate = "" +
  "<div class='card text-white bg-dark mb-3' id='{{id}}'>" +
  // "<img class='card-img-top' src='https://picsum.photos/300/200/?random' alt='Card image cap'>" +
  "<div class='card-body'>" +
  "<h5 class='card-title'>{{title}}</h5>" +
  "</div>" +
  "<ul class='list-group list-group-flush'>" +
  "<li class='list-group-item' style='color: black;'>Location: {{location}}</li>" +
  "<li class='list-group-item' style='color: black;'>City: {{city}}</li>" +
  "<li class='list-group-item' style='color: black;'>Time: {{start_time}}</li>" +
  "</ul>" +
  "</div>";

var wishlistTemplate = "" +
  "<div class='card text-white bg-dark mb-3'>" +
  // "<img class='card-img-top' src='https://picsum.photos/300/200/?random' alt='Card image cap'>" +
  "<div class='card-body'>" +
  "<h5 class='card-title'>{{title}}</h5>" +
  "</div>" +
  "<ul class='list-group list-group-flush'>" +
  "<li class='list-group-item' style='color: black;'>Location: {{location}}</li>" +
  "<li class='list-group-item' style='color: black;'>City: {{city}}</li>" +
  "<li class='list-group-item' style='color: black;'>Time: {{start_time}}</li>" +
  "</ul>" +
  "<button type='button' class='btn btn-primary' id='{{id}}''>Event Detail</button>" +
  "<button type='button' class='btn btn-danger' id='del-{{id}}'>Delete</button>" +
  "</div>";

var Application = {
  initApplication: function () {
    $(window).load('pageinit', '#home', function () {
      Application.initHome();
    });
    $(window).load('pageinit', '#wishlist', function () {
      Application.initWishlist();
    });
    $(window).load('pageinit', '#tickets', function () {
      Application.initTickets();
    });
    $(window).load('pageinit', '#login', function () {
      Application.initLogin();
    });
    $('#loginSubmit').on('click', Application.login);
    $('#registerSubmit').on('click', Application.register);
    $('#formEvent').on('submit', Application.createEvent);
  },

  initHome: function () {
    // Menghapus tombol add event ketika user belum login
    if (localStorage.token != null) {
      $('#homepage-main').append('<a href="#create-event" role="button" class="float" data-transition="slidedown" id="create-button"><i class="fa fa-plus my-float"></i></a>');
    }

    $('#event-list').empty();
    var appendEvent = function (event) {
      $('#event-list').append(Mustache.render(eventsTemplate, event));
    }

    $.ajax({
      type: "GET",
      url: "https://freevent.herokuapp.com/api/events",
      beforeSend: function () {
        $.mobile.loading('show', {
          text: 'Please wait while retrieving data...',
          textVisible: true
        });
      },
      success: function (response) {
        response.events.forEach(function (event) {
          appendEvent(event);
          $(document).on('click', '#' + event.id, function (e) {
            Application.initSingle(event.id);
            window.location.href = '#single?id=' + event.id;
          });
        });
      },
      complete: function () {
        $.mobile.loading('hide');
      }
    });
  },

  initLogin: function () {
    if (localStorage.token != null) {
      $('#login-form').empty();
      $('#login-form').append('<button type="button" class="btn btn-danger" id="logout">Logout</button>');
    }

    // Logout
    $('#login-form').on('click', '#logout', function () {
      console.log('logout clicked');
      localStorage.clear();
      location.reload();
    });
  },

  initWishlist: function () {
    if (localStorage.token == null) {
      $('#not-logged-in1').append("<div class='alert alert-danger' role='alert'>You are not logged in.</div>");
    } else {
      $('#not-logged-in1').remove();
      var appendWishlist = function (event) {
        $('#wishlist-list').append(Mustache.render(wishlistTemplate, event));
      }

      $.ajax({
        type: "GET",
        url: "https://freevent.herokuapp.com/api/wishlist",
        data: {
          token: localStorage.getItem('token'),
        },
        beforeSend: function () {
          $.mobile.loading('show', {
            text: 'Please wait while retrieving data...',
            textVisible: true
          });
        },
        success: function (response) {
          $('#wishlist-list').empty();
          console.log(response);
          response.events.forEach(function (event) {
            appendWishlist(event);
            $(document).on('click', '#' + event.id, function (e) {
              Application.initSingle(event.id);
              window.location.href = '#single?id=' + event.id;
            });

            // Hapus dari wishlist
            $('#wishlist-list').on('click', '#del-' + event.id, function (e) {
              $.ajax({
                type: "DELETE",
                url: "https://freevent.herokuapp.com/api/wishlist/" + event.id,
                data: {
                  token: localStorage.getItem('token'),
                },
                success: function (response) {
                  Application.initWishlist();
                }
              });
            });
          });
        },
        complete: function () {
          $.mobile.loading('hide');
        }
      });
    }
  },

  initTickets: function () {
    if (localStorage.token == null) {
      $('#not-logged-in').append("<div class='alert alert-danger' role='alert'>You are not logged in.</div>");
    } else {
      $('#not-logged-in').remove();
      var appendTicket = function (ticket) {
        $('#tickets-list').append("<a href='#ticket' data-transition='slidedown' class='list-group-item list-group-item-action' id='ticket-" + ticket.ticket_id + "'>Ticket ID: #" + ticket.ticket_id + ", Event: " + ticket.title + "</a>");
      }

      $.ajax({
        type: "GET",
        url: "https://freevent.herokuapp.com/api/tickets",
        data: {
          token: localStorage.getItem('token'),
        },
        beforeSend: function () {
          $.mobile.loading('show', {
            text: 'Please wait while retrieving data...',
            textVisible: true
          });
        },
        success: function (response) {
          $('#tickets-list').empty();
          console.log(response);
          response.events.forEach(function (event) {
            appendTicket(event);
            $(document).on('click', '#ticket-' + event.ticket_id, function (e) {
              Application.initTicket(event.id);
              // window.location.href = '#single?id=' + event.id;
            });
          });
        },
        complete: function () {
          $.mobile.loading('hide');
        }
      });
    }


  },

  initSingle: function (id) {
    $.ajax({
      type: "GET",
      url: "https://freevent.herokuapp.com/api/events/" + id,
      beforeSend: function () {
        $.mobile.loading('show', {
          text: 'Please wait while retrieving data...',
          textVisible: true
        });
      },
      beforeSend: function () {
        $.mobile.loading('show', {
          text: 'Please wait while retrieving data...',
          textVisible: true
        });
      },
      success: function (response) {
        event = response.event;
        $('#single-img, #single-title, #single-desc, #single-quota, #single-loc, #single-city, #single-start, #single-end').empty();
        $('#single-img').attr("src", "https://picsum.photos/300/200/?random"); //+ event.image_url);
        $('#single-title').append(event.title);
        $('#single-desc').append(event.description);
        $('#single-quota').append('Quota: ' + event.quota);
        $('#single-loc').append('Location: ' + event.location);
        $('#single-city').append('City: ' + event.city);
        $('#single-start').append('Start: ' + event.start_time);
        $('#single-end').append('End: ' + event.end_time);

        $('#atw').unbind().on('click', function () {
          console.log('atw clicked');
          $.ajax({
            type: "POST",
            url: "https://freevent.herokuapp.com/api/wishlist",
            dataType: "json",
            data: {
              event_id: id,
              token: localStorage.getItem('token')
            },
            success: function (response) {
              if (response.msg == null) {
                // $('#atw-or-reg').append("<div class='alert alert-danger' role='alert'>Error</div>");
                alert('Please login first');
              } else {
                console.log(response.msg);
                // $('#atw-or-reg').append("<div class='alert alert-success' role='alert'>Added to wishlist</div>");
                Application.initWishlist();
                window.location.href = '#wishlist';
              }
            },
            error: function () {
              alert('Please login first');
            }
          });
        });

        $('#reg').unbind().on('click', function () {
          $.ajax({
            type: "POST",
            url: "https://freevent.herokuapp.com/api/tickets",
            dataType: "json",
            data: {
              event_id: id,
              token: localStorage.getItem('token')
            },
            success: function (response) {
              if (response.msg == null) {
                // $('#atw-or-reg').append("<div class='alert alert-danger' role='alert'>Error</div>");
                alert('Please login first');
              } else {
                console.log(response.msg);
                // $('#atw-or-reg').append("<div class='alert alert-success' role='alert'>Registration success</div>");
                Application.initTickets();
                window.location.href = '#tickets';
              }
            },
            error: function () {
              alert('Please login first');
            }
          });
        });
      },
      complete: function () {
        $.mobile.loading('hide');
      }
    });
  },

  login: function () {
    $.ajax({
      type: "POST",
      url: "https://freevent.herokuapp.com/api/user/login",
      dataType: "json",
      data: {
        email: $('#emailLogin').val(),
        password: $('#passwordLogin').val()
      },
      success: function (data) {
        console.log(data);
        localStorage.token = data.token;
        Application.initApplication();
        // Application.initHome();
        // Application.initTickets();
        // Application.initWishlist();
        window.location.href = '#home';
      },
      error: function () {
        $('#loginField').append("<div class='alert alert-danger' role='alert'>" +
          "Login Failed" +
          "</div>");
      }
    });

  },

  register: function () {
    $.ajax({
      type: "POST",
      url: "https://freevent.herokuapp.com/api/user/register",
      dataType: "json",
      data: {
        name: $('#name').val(),
        email: $('#email').val(),
        password: $('#password').val()
      },
      success: function (response) {
        console.log(response);
        localStorage.token = response.token;
        Application.initApplication();
        // Application.initLogin();
        // Application.initHome();
        // Application.initTickets();
        // Application.initWishlist();
        window.location.href = '#home';
      },
      error: function () {
        $('#loginField').append("<div class='alert alert-danger' role='alert'>" +
          "Login Failed" +
          "</div>");
      }
    });

  },

  createEvent: function () {
    var form = $('form')[0]; // You need to use standard javascript object here
    var formData = new FormData(form);
    formData.append('token', localStorage.getItem('token'));
    console.log(formData);

    if (localStorage.token == null) {
      alert('Please Login First');
      window.location.href = '#login';
    }

    $.ajax({
      type: "POST",
      url: "https://freevent.herokuapp.com/api/events",
      data: formData,
      contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
      processData: false, // NEEDED, DON'T OMIT THIS
      success: function (response) {
        if (response.msg == null) {
          $('#create-error').append("<div class='alert alert-danger' role='alert' id='create-error'>Error</div>");
        } else {
          console.log(response.msg);
          Application.initHome();
          alert('SUCCESS');
        }
      },
      error: function () {
        alert("Error");
      }
    });
  },

  initTicket: function (id) {
    $.ajax({
      type: "GET",
      url: "https://freevent.herokuapp.com/api/tickets/" + id,
      data: {
        token: localStorage.getItem('token'),
      },
      success: function (response) {
        event = response.event;
        $('#ticket-id, #ticket-title, #ticket-loc, #ticket-start').empty();
        $('#ticket-id').append('Ticket ID: #' + response.ticket_id);
        $('#ticket-title').append(event.title);
        $('#ticket-loc').append('Location: ' + event.location + ', ' + event.city);
        $('#ticket-start').append('Start: ' + event.start_time);
      },
    });
  },

  test: function () {
    $.ajax({
      type: "GET",
      url: "https://freevent.herokuapp.com/api/tickets/8",
      // dataType: "json",
      data: {
        token: localStorage.getItem('token'),
      },
      success: function (response) {
        console.log(response);
      },
      error: function () {
        window.location.href = '#login';
      }
    });
  },
}