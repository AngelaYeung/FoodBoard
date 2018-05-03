/**
 * Creates new card
 */
function addNewItem(id, name, description, foodGroup, dateTime, img) {

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

    // grabs the name from the form so that it will be appended to cardDiv
    foodName.innerHTML = name;

    var buttonDiv = document.createElement("div");
    buttonDiv.setAttribute("class", "col-xs-2");
    
    var toggleButton = document.createElement("button");
    toggleButton.setAttribute("data-toggle", "collapse");
    toggleButton.setAttribute("data-target", `#collapseDiv${id}`);
    toggleButton.setAttribute("class", "collapse-button");

    var toggleDiv = document.createElement("div");
    toggleDiv.setAttribute("id", `collapseDiv${id}`);
    toggleDiv.setAttribute("class", "collapse");

    //takes the contents of the description 
    var foodDescription = document.createElement("p");
    foodDescription.innerHTML = description;
    
    var imageDiv = document.createElement("div");
    imageDiv.setAttribute("class","imgDiv");

    var foodImg = document.createElement("img");
    foodImg.setAttribute("class", "food-img");
    foodImg.src = `/images/${img}`;

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
    $("#card-list").append(cardDiv);

    /** Clearing Forms */
    $('#postForm').trigger('reset');

    /** Hides Modal */
    if($('#itemModal').hasClass('show')) {
        $('#itemModal').modal('toggle');
    }
}