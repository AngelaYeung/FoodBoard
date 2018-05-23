document.onreadystatechange = function () {
  var screenHeight = $(window).outerHeight();
  var navbarHeight = $('.navbar-brand-sm').outerHeight();
  var sum = screenHeight + navbarHeight;
  $('#background-sm img, background-lg img').css('height', `${sum}`);

  var sum2 = screenHeight / 2;
  if ($(window).width() <= 900) {
    $('#homepage-body').css('transform', `translate(0%, -${sum2}%)`);
  } else {
    $('#homepage-body').css('transform', `translate(0%, -${sum2 / 1.75}%)`);
  }
}

$(document).ready(function () {
  //close modals with back btn
$('.modal').on('show.bs.modal', function (e) {
  window.history.pushState('forward', null, '#modal');
});

$('.modal').on('hide.bs.modal', function (e) {
  //pop the forward state to go back to original state before pushing the "Modal!" button
});

$(window).on('popstate', function () {
  $('.modal').modal('hide');
});


  // add scrollspy onto body of the page for about link
  $("#our-team-link").click(function () {
    $('html, body').animate({
      scrollTop: $("#our-team").offset().top
    }, 500);
  });

  // add scrollspy onto body of the page for how it works link
  $("#contact-us-link").click(function () {
    $('html, body').animate({
      scrollTop: $("#contact-us").offset().top
    }, 500);
  });

  // add scrollspy onto body of the page for our-team link
  $("#contact-us-link-desktop").click(function () {
    $('html, body').animate({
      scrollTop: $("#contact-us").offset().top
    }, 500);
  });

  // add scrollspy onto body of the page for contact us link
  $("#getting-started-link").click(function () {
    $('html, body').animate({
      scrollTop: $("#getting-started").offset().top
    }, 500);
  });

  // add scrollspy onto body of the page for login link
  $("#getting-started-link-desktop").click(function () {
    $('html, body').animate({
      scrollTop: $("#getting-started").offset().top
    }, 500);
  });

  // add scrollspy onto body of the page for home link        
  $("#home-link").click(function () {
    $('html, body').animate({
      scrollTop: $("#page-top").offset().top
    }, 500);
  });

  $('#navDropdown').click(function () {
    if ($(".dropdown-menu").length > 0) {
      $('.navbar-fixed-top').css('background-color', "#4EB266");
    } else {
      console.log('closed');
      $('.navbar-fixed-top').css('background-color', "transparent");
    }
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

  //change navbar colour green when opening dropdown
  $(function () {
    $('.navbar-color-change').on('click', () => {
      if ($('#color-change').attr('aria-expanded') === 'false') {
        $('.navbar-fixed-top').css("background-color", "#4EB266");
      } else {
        $('.navbar-fixed-top').css("background-color", "transparent");
        $('.navbar-fixed-top').css("transition-property", "none");
      }
    });
  });

  $("#register_pwd_confirm, #register_pwd").on('change', (e) => {
    if (validatePassword()) {
      $("#register_pwd").css("border", "2px solid #4EB266");
      $("#register_pwd_confirm").css("border", "2px solid #4EB266");
      $('.invalid-feedback').hide();
      $('#register-submit').removeClass('disabled');
      $('#register-submit').removeAttr('disabled')
    } else {
      $("#register_pwd").css("border", "2px solid #E34234");
      $("#register_pwd_confirm").css("border", "2px solid #E34234");
      $('.invalid-feedback').show();
      $('#register-submit').addClass('disabled');
      $('#register-submit').attr('disabled', 'disabled');
    }
  });

  $('#logreg-modal').on('shown.bs.modal', function () {
    $('#log-first-field, #reg-first-field').focus();
  });
});


$("#newPW,#confirmPW").on('change', (e) => {
  if (validatePassword()) {
    $("#confirmPW").css("border", "2px solid #4EB266");
    $("#newPW").css("border", "2px solid #4EB266");
  } else {
    $("#confirmPW").css("border", "2px solid #E34234");
    $("#newPW").css("border", "2px solid #E34234");
  }
});

//validate the password
function validatePassword() {
  if ($("#register_pwd").val() !== $("#register_pwd_confirm").val()) {
    return false;
  } else {
    return true;
  }
}