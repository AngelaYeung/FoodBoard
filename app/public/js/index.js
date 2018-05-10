//const socket = io();

$(document).ready(function () {

      // add scrollspy onto body of the page for about link
      $("#about-link").click(function () {
        $('html, body').animate({
          scrollTop: $("#homepage-body-container").offset().top
        }, 500);
      });

      // add scrollspy onto body of the page for how it works link
      $("#how-link").click(function () {
        $('html, body').animate({
          scrollTop: $("#how-it-works").offset().top
        }, 500);
      });

      // add scrollspy onto body of the page for our-team link
      $("#team-link").click(function () {
        $('html, body').animate({
          scrollTop: $("#our-team").offset().top
        }, 500);
      });

      // add scrollspy onto body of the page for login link
      $("#about-link").click(function () {
        $('html, body').animate({
          scrollTop: $("#homepage-body-container").offset().top
        }, 500);
      });

      // add scrollspy onto body of the page for home link        
      $(".navbar-brand a").click(function () {
        $('html, body').animate({
          scrollTop: $("#page-top").offset().top
        }, 500);
      });


    // Scroll property to transition navbar from transparent to green
    $(function () {
      $(document).scroll(function () {
        var $nav = $(".navbar-fixed-top");
        if ($(window).scrollTop() >= 100) {
          $nav.css("background-color", "#4EB266");
          $nav.css("transition", "background-color 300ms linear");
        } else {
          $nav.css("background-color", "transparent");
          $nav.css("transition", "background-color 300ms linear");
        }
      });
    });

    /*************************************************************************
       * 
       *         FOOD BOARD REGISTER FEATURE - CLIENT SIDE
       * 
       *************************************************************************/


      // /** Sends data from post-form to server.js */
      // $('#register-submit').click(function () {
      //   console.log('Register triggered!');
      //   });
      //   if ($('#register-pwd').val() == $('#register-pwdConfirm').val()) {
      //     console.log('Password is a match');
      //     socket.emit('register', {
      //       firstName: $('#register-firstName').val(),
      //       lastName: $('#register-lastName').val(),
      //       email: $('#register-email').val(),
      //       password: $('#register-pwd').val(),
      //       suiteNumber: $('#register-suiteNumber').val()
      //     });
      //   } else {
      //     console.log("Password does not match.");
      //   }
      //   return false;
      // });
      // socket.on('register unsuccessful return', (register) => {
      //   if (register.length > 0) {
      //     console.log("Registration unsuccessful, this email address has already been registered.");
      //   }
      // });
      // socket.on('register successful return', (success) => {
      //   console.log("Successful registration!" + success);
      // });

});
