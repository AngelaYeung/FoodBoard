$(document).ready(() => {

  //removes the disabled attribute from the submit button if the input fields are filled and the new passwords are the same
  $("#pw-form").change(() => {
    if (pwFieldsFilled() && validatePassword()) {
      $("#pw-submit").removeClass("disabled");
      $("#pw-submit").removeAttr('disabled');
    } else {
      $("#pw-submit").addClass('disabled');
      $("#pw-submit").attr('disabled', 'disabled');
    }
  });

  $("#suite-form").change(() => {
    if (pwSuiteFieldsFilled()) {
      $("#suite-submit").removeClass("disabled");
      $("#suite-submit").removeAttr('disabled');
    } else {
      $("#suite-submit").addClass('disabled');
      $("#suite-submit").attr('disabled', 'disabled');
    }
  });


  //Change password field styling green if right, red if incorrect
  $("#newPW,#confirmPW").on('change', (e) => {
    if (validatePassword()) {
      $("#confirmPW").css("border", "2px solid #4EB266");
      $("#newPW").css("border", "2px solid #4EB266");
      $('.invalid-feedback').hide();
    } else {
      $("#confirmPW").css("border", "2px solid #E34234");
      $("#newPW").css("border", "2px solid #E34234");
      $('.invalid-feedback').show();
    }
  });

});

//validate the password
function validatePassword() {
  return ($("#confirmPW").val() == $("#newPW").val());
};

/**
 * Returns true if the password change forms are filled
 */
function pwFieldsFilled() {
  return (!($("#currentPW").val().length === 0) &&
    !($("#newPW").val().length === 0) &&
    !($("#confirmPW").val().length === 0));
};

/**
 * Returns true if the password change forms are filled for suite Number
 */
function pwSuiteFieldsFilled() {
  return (!($(".currentPW").val().length === 0) && (!($('#newSuite').val().length === 0)))
};