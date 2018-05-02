//Event handler for when the submit button is clicked.
//Should post the contents of the form onto the board.
$("#submit").click(function () {
    var nameContent = $("#name").val();
    var descriptionContent = $("#description").val();

    //createFoodObject();
    addNewItem();
    }
);

//Function for posting the user input onto the board
function addNewItem() {

    var cardDiv = document.createElement("div");
    cardDiv.setAttribute("class","cardContainer");

    var foodName = document.createElement("h2");
    // grabs the name from the form so that it will be appended to cardDiv
    foodName.innerHTML = $("#name").val();

    //takes the contents of the description 
    var foodDescription = document.createElement("p");
    //foodDescription.innerHTML = $("#description").val();

    var foodImg = document.createElement("img");

    //$("#datetimepicker").datetimepicker();
    var selectedFile = document.getElementById("file-input").files[0];
    foodDescription.innerHTML = selectedFile.name;

    cardDiv.appendChild(foodName);
    cardDiv.appendChild(foodDescription);
    cardDiv.appendChild(foodImg);

    $("#board").append(cardDiv);
}

// function handleFileSelect(event) {

//     var file = event.target.files[0];
//     var output = "";
//     output += file.name

// }
//File reader
function imageReader() {
    var selectedFile = document.getElementById("file-input").files[0];

    var reader = new FileReader();
    return imgSRC = window.URL.createObjectURL(imgObj);

}

//Will take input received the form and create a JSON object.
// function createFoodObject() {

// }
