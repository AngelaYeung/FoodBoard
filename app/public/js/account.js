$(document).ready(() => {
    console.log("Script loaded");

    //removes the disabled attribute from the submit button if the input fields are filled and the new passwords are the same
    $("#pw-form").change(() => {
        console.log("Checking form");
        if (pwFieldsFilled() && validatePassword()) {
            $("#pw-submit").removeClass("disabled");
        };
    });


    //Change password field styling green if right, red if incorrect
    $("#newPW,#confirmPW").on('change', (e) => {
        if (validatePassword()) {
            $("#confirmPW").css("border", "2px solid #4EB266");
            $("#newPW").css("border", "2px solid #4EB266");
        } else {
            $("#confirmPW").css("border", "2px solid #E34234");
            $("#newPW").css("border", "2px solid #E34234");
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
    return (!($("#currentPW").val().length === 0)
        && !($("#newPW").val().length === 0)
        && !($("#confirmPW").val().length === 0));
};


