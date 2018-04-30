    //Event handler for when the submit button is clicked.
    //Should post the contents of the form onto the board.
    $("#submit").click(function() {
        var nameContent = $("#name").val();
        var descriptionContent = $("#description").val();
        
        addNewItem();
  
        }
      );
  
      //Function for posting the user input onto the board
      function addNewItem() {
          
          var cardDiv = document.createElement("div");
          var foodName = document.createElement("h2");
          // grabs the name from the form so that it will be appended to cardDiv
          foodName.innerHTML = $("#name").val();
  
          //takes the contents of the description 
          var foodDescription = document.createElement("p");
          foodDescription.innerHTML = $("#description").val();
          
          cardDiv.appendChild(foodName);
          cardDiv.appendChild(foodDescription);
  
          $("#board").append(cardDiv);
      }