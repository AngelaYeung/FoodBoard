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

// document.getElementById('file-input').addEventListener('change', handleFileSelect, false);

/**
* Creates new card based on the parameters passed into the function.
*/
function addNewItem(id, name, description, dateTime, foodGroup, img) {

  var cardDiv = document.createElement("div");
  cardDiv.setAttribute("id", `card${id}`);
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

  var dateText = document.createElement("p");
  dateText.innerHTML = "Expires on " + moment(dateTime).format('MM/DD/YYYY');

  var buttonDiv = document.createElement("div");
  buttonDiv.setAttribute("class", "col-xs-2");
  
  var toggleButton = document.createElement("anchor");
  toggleButton.setAttribute("data-toggle", "collapse");
  toggleButton.setAttribute("data-target", `#collapseDiv${id}`);
  toggleButton.setAttribute("class", "collapse-button");

  var toggleImg = document.createElement("img");
  toggleImg.src = "./Pictures/chevron-down.png";

  var toggleDiv = document.createElement("div");
  toggleDiv.setAttribute("id", `collapseDiv${id}`);
  toggleDiv.setAttribute("class", "collapse");

  var foodCategory = document.createElement("p");
  foodCategory.innerHTML = foodGroup;
  //takes the contents of the description 
  var foodDescription = document.createElement("p");
  foodDescription.innerHTML = description;
  
  var imageDiv = document.createElement("div");
  imageDiv.setAttribute("class","imgDiv");

  var foodImg = document.createElement("img");
  foodImg.setAttribute("class", "food-img");
  foodImg.src = `/images/${img}`;


  cardDiv.appendChild(imageDiv);
  imageDiv.appendChild(foodImg);
  cardDiv.appendChild(headerDiv);
  cardDiv.appendChild(contentDiv);

  contentDiv.appendChild(toggleDiv);

  headerDiv.appendChild(textDiv);
  headerDiv.appendChild(buttonDiv);
  buttonDiv.appendChild(toggleButton);
  toggleButton.appendChild(toggleImg);
  textDiv.appendChild(foodName);
  textDiv.appendChild(dateText);

  toggleDiv.appendChild(foodCategory);
  toggleDiv.appendChild(foodDescription);

  $("#card-list").prepend(cardDiv);

  /** Clearing Forms */
  $('#postForm').trigger('reset');

   /** Hides Modal */
   if ($('#itemModal').is(':visible')) {
      $('#itemModal').modal('toggle');
  }
}
