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