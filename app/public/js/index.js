
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



  $("#register_pwd_confirm").on('change', (e) => {
    console.log("change");
    if (validatePassword()) {
      document.getElementById("register_pwd").style.borderColor = '#4EB266';
      document.getElementById("register_pwd_confirm").style.borderColor = '#4EB266';
    } else {
      document.getElementById("register_pwd").style.borderColor = "#E34234";
      document.getElementById("register_pwd_confirm").style.borderColor = "#E34234";
    }
  });

  $("#register_pwd").on('change', (e) => {
    console.log("change");
    if (validatePassword()) {
      document.getElementById("register_pwd").style.borderColor = '#4EB266';
      document.getElementById("register_pwd_confirm").style.borderColor = '#4EB266';
    } else {
      document.getElementById("register_pwd").style.borderColor = "#E34234";
      document.getElementById("register_pwd_confirm").style.borderColor = "#E34234";
    }
  });

});

function validatePassword() {
  var pass1 = document.getElementById("register_pwd").value;
  var pass2 = document.getElementById("register_pwd_confirm").value;
  if (pass1 !== pass2) {
    return false;
  }
  else {
    return true;
  }
}