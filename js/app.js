var eventsTemplate = "" +
  "<div class='card text-white bg-dark mb-3' id='{{id}}'>" +
  "<div class='card-body'>" +
  "<h5 class='card-title'>{{title}}</h5>" +
  "</div>" +
  "<ul class='list-group list-group-flush'>" +
  "<li class='list-group-item' style='color: black;'>Location: {{location}}</li>" +
  "<li class='list-group-item' style='color: black;'>City: {{city}}</li>" +
  "<li class='list-group-item' style='color: black;'>Time: {{start_time}}</li>" +
  '<span class="badge badge-primary">{{categories}}</span>'
"</ul>" +
  "</div>";

var wishlistTemplate = "" +
  "<div class='card text-white bg-dark mb-3'>" +
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
    // Initialize homepage
    $(window).load('pageinit', '#home', function () {
      Application.initHome();
    });

    // Initialize wishlist page
    $(window).load('pageinit', '#wishlist', function () {
      Application.initWishlist();
    });

    // Initialize tickets page
    $(window).load('pageinit', '#tickets', function () {
      Application.initTickets();
    });

    // Initialize login/user page
    $(window).load('pageinit', '#login', function () {
      Application.initLogin();
    });

    // Menghandle klik pada tombol login
    $('#loginSubmit').on('click', Application.login);

    // Menghandle klik pada tombol register
    $('#registerSubmit').on('click', Application.register);

    // Menghandle submit form create event
    $('#formEvent').on('submit', Application.createEvent);
  },

  initHome: function () {
    // Menghapus tombol create event ketika user belum login
    if (localStorage.token != null) {
      $('#homepage-main').append('<a href="#create-event" role="button" class="float" data-transition="slidedown" id="create-button"><i class="fa fa-plus my-float"></i></a>');
    }

    // Mengisi event-list yang ada di homepage
    $('#event-list').empty();
    var appendEvent = function (event) {
      $('#event-list').append(Mustache.render(eventsTemplate, event));
    }

    // Mengirim request ke backend untuk mendapatkan semua event
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
    // Ketika user memiliki token, maka halaman login/user diubah menjadi tombol logout
    if (localStorage.token != null) {
      $('#login-form').empty();
      $('#login-form').append('<button type="button" class="btn btn-danger" id="logout">Logout</button>');
    }

    // Menghandle klik pada tombol logout
    $('#login-form').on('click', '#logout', function () {
      console.log('logout clicked');
      localStorage.clear();
      location.reload();
    });
  },

  initWishlist: function () {
    // Ketika user tidak memiliki token, maka halaman wishlist diisi pemberitahuan bahwa belum login
    if (localStorage.token == null) {
      $('#not-logged-in1').append("<div class='alert alert-danger' role='alert'>You are not logged in.</div>");
    } else { // Jika memiliki token, maka mengisi wishlist-list dengan event yang didapat dari response dari server
      $('#not-logged-in1').remove();
      var appendWishlist = function (event) {
        $('#wishlist-list').append(Mustache.render(wishlistTemplate, event));
      }

      // Mengirim request ke backend untuk mendapatkan event yang ada di wishlist user
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
          response.fevents.orEach(function (event) {
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
    // Ketika user tidak memiliki token, maka halaman tickets diisi pemberitahuan bahwa belum login
    if (localStorage.token == null) {
      $('#not-logged-in').append("<div class='alert alert-danger' role='alert'>You are not logged in.</div>");
    } else { // Jika memiliki token, maka mengisi tickets-list dengan ticket yang didapat dari response dari server
      $('#not-logged-in').remove();
      var appendTicket = function (ticket) {
        $('#tickets-list').append("<a href='#ticket' data-transition='slidedown' class='list-group-item list-group-item-action' id='ticket-" + ticket.ticket_id + "'>Ticket ID: #" + ticket.ticket_id + ", Event: " + ticket.title + "</a>");
      }

      // Mengirim request ke backend untuk mendapatkan ticket yang dimiliki user
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
            });
          });
        },
        complete: function () {
          $.mobile.loading('hide');
        }
      });
    }


  },

  // Method untuk halaman single event
  initSingle: function (id) {
    // Mengirim request untuk mendapatkan detail setiap event
    $.ajax({
      type: "GET",
      url: "https://freevent.herokuapp.com/api/events/" + id,
      beforeSend: function () {
        $.mobile.loading('show', {
          text: 'Please wait while retrieving data...',
          textVisible: true
        });
      },
      success: function (response) {
        event = response.event;
        $('#single-img, #single-title, #single-desc, #single-quota, #single-loc, #single-city, #single-start, #single-end, #single-categories').empty();
        $('#single-img').attr("src", "https://picsum.photos/300/200/?random"); //+ event.image_url);
        $('#single-categories').append(event.categories);
        $('#single-title').append(event.title);
        $('#single-desc').append(event.description);
        $('#single-quota').append('Quota: ' + event.quota);
        $('#single-loc').append('Location: ' + event.location);
        $('#single-city').append('City: ' + event.city);
        $('#single-start').append('Start: ' + event.start_time);
        $('#single-end').append('End: ' + event.end_time);

        // Menghandle klik pada tombol atw (Add to Wishlist)
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
                alert('Please login first');
              } else {
                console.log(response.msg);
                Application.initWishlist();
                window.location.href = '#wishlist';
              }
            },
            error: function () {
              alert('Please login first');
            }
          });
        });

        // Menghandle klik pada tombol register ke event
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
                alert('Please login first');
              } else {
                console.log(response.msg);
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
    // Mengirim POST request untuk mendapatkan token
    $.ajax({
      type: "POST",
      url: "https://freevent.herokuapp.com/api/user/login",
      dataType: "json",
      data: {
        email: $('#emailLogin').val(),
        password: $('#passwordLogin').val()
      },
      success: function (response) {
        // console.log(response);
        localStorage.token = response.token;
        Application.initApplication();
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
    // Mengirim POST request untuk register + mendapatkan token
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
        window.location.href = '#home';
      },
      error: function () {
        $('#loginField').append("<div class='alert alert-danger' role='alert'>" +
          "Register Failed" +
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

    // Mengirim POST request untuk menambah event ke database
    $.ajax({
      type: "POST",
      url: "https://freevent.herokuapp.com/api/events",
      data: formData,
      contentType: false,
      processData: false,
      success: function (response) {
        if (response.msg == null) {
          alert('You must be logged in to create an event!');
        } else {
          console.log(response.msg);
          Application.initHome();
          alert('SUCCESS');
        }
      },
      error: function () {
        alert("Token expired");
      }
    });
  },

  // Method untuk menampilkan detail tiket
  initTicket: function (id) {
    // Mengirim GET request untuk mendapatkan detail tiket dengan id tertentu
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
}