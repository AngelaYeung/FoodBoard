<<<<<<< HEAD
/**
 * Creates new card
 */
function addNewItem(id, name, description, foodGroup, dateTime, img) {
=======
// Creates a thumbnail when an image has been uploaded
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // Only process image files.
    if (files[0].type.match('image.*')) {


        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                // Render thumbnail.
                var span = document.createElement('span');
                span.innerHTML = ['<img class="thumb" src="', e.target.result,
                    '" title="', escape(theFile.name), '"/>'].join('');
                document.getElementById("output").appendChild(span);
            };
        })(files[0]);

        // Read in the image file as a data URL.
        reader.readAsDataURL(files[0]);
    }

}

document.getElementById('file-input').addEventListener('change', handleFileSelect, false);


//Event handler for when the submit button is clicked.
//Should post the contents of the form onto the board.
$("#submit").click(function () {
    addNewItem();
});

//Function for posting the user input onto the board
function addNewItem() {
>>>>>>> develop

    var cardDiv = document.createElement("div");
    cardDiv.setAttribute("id", "card");
    cardDiv.setAttribute("class", "cardContainer");
    
    var contentDiv = document.createElement("div");
    contentDiv.setAttribute("class", "contentDiv");

    var headerDiv = document.createElement("div");
    headerDiv.setAttribute("class","header-Div");
    //headerDiv.innerHTML = "i am headerdiv";
    
    var textDiv = document.createElement("div");
    textDiv.setAttribute("class", "col-xs-10");
    
    var foodName = document.createElement("h4");
<<<<<<< HEAD

    // grabs the name from the form so that it will be appended to cardDiv
    foodName.innerHTML = name;
=======
    // grabs the name from the form so that it will be appended to cardDiv
    foodName.innerHTML = $("#name").val();
>>>>>>> develop

    var buttonDiv = document.createElement("div");
    buttonDiv.setAttribute("class", "col-xs-2");
    
    var toggleButton = document.createElement("button");
    toggleButton.setAttribute("data-toggle", "collapse");
<<<<<<< HEAD
    toggleButton.setAttribute("data-target", `#collapseDiv${id}`);
    toggleButton.setAttribute("class", "collapse-button");

    var toggleDiv = document.createElement("div");
    toggleDiv.setAttribute("id", `collapseDiv${id}`);
    toggleDiv.setAttribute("class", "collapse");

    //takes the contents of the description 
    var foodDescription = document.createElement("p");
    foodDescription.innerHTML = description;
=======
    toggleButton.setAttribute("data-target", "#collapseDiv");
    toggleButton.setAttribute("class", "collapse-button");

    var toggleDiv = document.createElement("div");
    toggleDiv.setAttribute("id", "collapseDiv");
    toggleDiv.setAttribute("class", "collapse");
    //takes the contents of the description 
    var foodDescription = document.createElement("p");
    foodDescription.innerHTML = $("#description").val();
>>>>>>> develop
    
    var imageDiv = document.createElement("div");
    imageDiv.setAttribute("class","imgDiv");

    var foodImg = document.createElement("img");
    foodImg.setAttribute("class", "food-img");
<<<<<<< HEAD
    foodImg.src = `/images/${img}`;
=======
    foodImg.src = "./Pictures/hero-image-flat.jpg";

    var claimButton = document.createElement("button");
    claimButton.setAttribute("class", "claim");
    
>>>>>>> develop

    //$("#datetimepicker").datetimepicker();
    //cardDiv.appendChild(foodImg);
    cardDiv.appendChild(imageDiv);
    imageDiv.appendChild(foodImg);
    cardDiv.appendChild(headerDiv);
    cardDiv.appendChild(contentDiv);

    //contentDiv.appendChild(headerDiv);
    contentDiv.appendChild(toggleDiv);

    headerDiv.appendChild(textDiv);
    headerDiv.appendChild(buttonDiv);
    buttonDiv.appendChild(toggleButton);
    textDiv.appendChild(foodName);

    toggleDiv.appendChild(foodDescription);
<<<<<<< HEAD
    $("#card-list").append(cardDiv);

    /** Clearing Forms */
    $('#postForm').trigger('reset');

    /** Hides Modal */
    if($('#itemModal').hasClass('show')) {
        $('#itemModal').modal('toggle');
    }
}
=======
    $("#board").append(cardDiv);
}

// function imageReader(file) {
//     var reader = new FileReader();

//     return imgSRC = window.URL.createObjectURL(imgObj);

// }

//Will take input received the form and create a JSON object.
// function createFoodObject() {

// }
>>>>>>> develop
