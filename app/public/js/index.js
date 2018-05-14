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

    //closes modal when clicking back button
    $(window).on("popstate", this.handleBackpress);
    document.addEventListener("backbutton", this.handleBackpress, false);

  });


  //Change password field red if password is incorrect
  $("#register_pwd_confirm").on('change', (e) => {
    if (validatePassword()) {
      document.getElementById("register_pwd").style.borderColor = '#4EB266';
      document.getElementById("register_pwd_confirm").style.borderColor = '#4EB266';
    } else {
      document.getElementById("register_pwd").style.borderColor = "#E34234";
      document.getElementById("register_pwd_confirm").style.borderColor = "#E34234";
    }
  });
  //Change password field red if password is incorrect
  $("#register_pwd").on('change', (e) => {
    e.preventDefault();
    if (validatePassword()) {
      document.getElementById("register_pwd").style.borderColor = '#4EB266';
      document.getElementById("register_pwd_confirm").style.borderColor = '#4EB266';
    } else {
      document.getElementById("register_pwd").style.borderColor = "#E34234";
      document.getElementById("register_pwd_confirm").style.borderColor = "#E34234";
    }
  });

});

//validate the password
function validatePassword() {
  if (document.getElementById("register_pwd").value !== document.getElementById("register_pwd_confirm").value) {
    return false;
  } else {
    return true;
  }
}

//closes modal when clicking back button
function handleBackpress(e) {
  e.preventDefault();
  e.stopPropagation();

  $(".modal").modal("hide");
  $(".modal-backdrop").remove();
}
