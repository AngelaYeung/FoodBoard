

// needs to be declared as a global variable to be in same scope as claimItem()
var socket;

/*************************************************************************
  * 
  *         FOOD BOARD CLAIM FEATURE - CLIENT SIDE
  * 
  *************************************************************************/

function claimItem(itemID) {
  socket.emit('claim item', {
    id: itemID
  });
};

$(document).ready(function () {
  socket = io();
  const uploader = new SocketIOFileUpload(socket);
  var image_name;


  /*************************************************************************
   * 
   *         FOOD BOARD POST FEATURE - CLIENT SIDE
   * 
   *************************************************************************/
<<<<<<< HEAD
  /** Uploads the image in form to server, and grabs its name */
  uploader.listenOnSubmit(document.getElementById('submit'), document.getElementById('file-input'));

  uploader.addEventListener('start', (event) => {
    image_name = event.file.name;
  });
=======

  // Checks file image submitted in form for correct type when inputted.
  if (window.File && window.FileReader && window.FormData) {

    $('#file-input').on('change', (e) => {
      image_name = Date.now();
      var file = e.target.files[0];
      if (file) {
        if (/^image\//i.test(file.type)) {
          readFile(file);
        } else {
          console.log('Not a valid Image');
          // DOM EVENT TO NOTIFY USER
        }
      }
    });

  } else {
    console.log("File Upload Not Supported");
    // DOM EVENT TO NOTIFY USER
  }

  /**
   * Reads the image file as a data URL
   * @param {} file   the image file uploaded in the form 
   */
  function readFile(file) {
    var reader = new FileReader();

    reader.onloadend = function () {
      processFile(reader.result, file.type);
    }

    reader.onerror = function () {
      console.log('There was an error reading this file');
    }

    reader.readAsDataURL(file);
  }

  /**
   * Resizes the image the image file
   * @param {*} dataURL   the dataURL of the image
   * @param {*} fileType  the fileType of the file
   */
  function processFile(dataURL, fileType) {
    var maxWidth = 325;
    var maxHeight = 400;

    var image = new Image();
    image.src = dataURL;

    image.onload = function () {
      var width = image.width;
      var height = image.height;
      var shouldResize = (width > maxWidth) || (height > maxHeight);

      if (!shouldResize) {
        sendFile(dataURL);
        return;
      }

      var newWidth;
      var newHeight;

      if (width > height) {
        newHeight = height * (maxWidth / width);
        newWidth = maxWidth;
      } else {
        newWidth = width * (maxHeight / height);
        newHeight = maxHeight;
      }

      var canvas = document.createElement('canvas');

      canvas.width = newWidth;
      canvas.height = newHeight;

      var context = canvas.getContext('2d');

      context.drawImage(this, 0, 0, newWidth, newHeight);

      canvas.toBlob((blob) => {
        console.log(blob);
        sendFile(blob);
      }, fileType);

    };

    image.onerror = function () {
      console.log('There was an error processing your file!');
      // DOM EVENT TO SHOW THAT SOMETHING WENT WRONG
    };
  }

  function sendFile(fileData) {
    var formData = new FormData();

    var png = 'png';

    formData.append('imageData', fileData);
    console.log('Uploaded');
    uploader.listenOnSubmitBlob(document.getElementById('submit'), fileData, `${image_name}.${png}`);
  }


  /** Uploads the image in form to server, and grabs its name */
  // uploader.listenOnSubmit(document.getElementById('submit'), document.getElementById('file-input'));

  // uploader.addEventListener('start', (event) => {
  //   image_name = "test.png";
  // });

>>>>>>> 266bd120df042cb231d7033cb093d655ad8dacc0

  /** Sends data from post-form to server.js */
  $('#submit').click(function () {
    console.log('Submit triggered!');

    if ($('#name').val().toLowerCase() === 'ilovefoodboard') {
      window.location.href = ('/snake');

    } else {
<<<<<<< HEAD
=======

>>>>>>> 266bd120df042cb231d7033cb093d655ad8dacc0
      socket.emit('post item', {
        name: $('#name').val(),
        description: $('#description').val(),
        dateTime: $('#datetimepicker').val(),
        foodgrouping: $('input[name=foodgrouping]:checked').val(),
<<<<<<< HEAD
        image: image_name
=======
        image: `${image_name}.png`
>>>>>>> 266bd120df042cb231d7033cb093d655ad8dacc0
      });
    }
    return false;
  });

  socket.on('post item return', (item) => {
    addNewItem(item.id, item.name, item.description, item.dateTime, item.foodgrouping, item.image);
  });


  /*************************************************************************
   * 
   *         FOOD BOARD LOAD FEATURE - CLIENT SIDE
   * 
   *************************************************************************/

  /**
   * When the window is loaded, trigger websocket event for server to fetch foodboard posts
   * from the data base. 
   */
  $(window).on('load', () => {
    console.log('Client: page loaded');
    socket.emit('page loaded');
  });


  socket.on('load foodboard', (items) => {
    for (var i = 0; i < items.length; i++) {
      addNewItem(items[i].itemID, items[i].foodName, items[i].foodDescription, items[i].foodGroup, items[i].foodExpiryTime,
        items[i].foodImage);
    }
  });;
<<<<<<< HEAD


  /*************************************************************************
   * 
   *         FOOD BOARD DELETE FEATURE - CLIENT SIDE
   * 
   *************************************************************************/

=======


  /*************************************************************************
   * 
   *         FOOD BOARD DELETE FEATURE - CLIENT SIDE
   * 
   *************************************************************************/

>>>>>>> 266bd120df042cb231d7033cb093d655ad8dacc0
  $('_claim-form').on('submit', (e) => {
    e.preventDefault();
    console.log(this.id);
  });

<<<<<<< HEAD
  socket.on('claim return', (itemID) => {
    $(`#card${itemID}`).remove(); //.remove() generates error
  });
=======
});











>>>>>>> 266bd120df042cb231d7033cb093d655ad8dacc0

  /**
   * Creates new card based on the parameters passed into the function.
   */
  function addNewItem(id, name, description, dateTime, foodGroup, img) {

<<<<<<< HEAD
    var cardDiv = document.createElement("div");
    cardDiv.setAttribute("id", `card${id}`);
    cardDiv.setAttribute("class", "cardContainer");

    var contentDiv = document.createElement("div");
    contentDiv.setAttribute("class", "contentDiv");

    var headerDiv = document.createElement("div");
    headerDiv.setAttribute("class", "header-Div");
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

    var toggleButton = document.createElement("button");
    toggleButton.setAttribute("data-toggle", "collapse");
    toggleButton.setAttribute("data-target", `#collapseDiv${id}`);
    toggleButton.setAttribute("class", "glyphicon glyphicon glyphicon-option-vertical collapse-button");

    // var toggleImg = document.createElement("img");
    // toggleImg.src = "./Pictures/chevron-down.png";

    var toggleDiv = document.createElement("div");
    toggleDiv.setAttribute("id", `collapseDiv${id}`);
    toggleDiv.setAttribute("class", "collapse");

    var foodCategory = document.createElement("p");
    foodCategory.innerHTML = foodGroup;
    //takes the contents of the description 
    var foodDescription = document.createElement("p");
    foodDescription.innerHTML = description;

    var imageDiv = document.createElement("div");
    imageDiv.setAttribute("class", "imgDiv");

    var foodImg = document.createElement("img");
    foodImg.setAttribute("class", "food-img");
    foodImg.src = `/images/${img}`;

    var claimForm = document.createElement("form");
    claimForm.setAttribute("class", "claim-form");
    claimForm.setAttribute("action", "javascript:void(0);"); //disables page refresh upon button click

    var claimButton = document.createElement("input");
    claimButton.setAttribute('onclick', `claimItem(${id})`);
    claimButton.setAttribute("class", "btn btn-primary");
    claimButton.setAttribute("type", "submit");
    claimButton.setAttribute("value", "Claim");

    cardDiv.appendChild(imageDiv);
    imageDiv.appendChild(foodImg);
    cardDiv.appendChild(headerDiv);
    cardDiv.appendChild(contentDiv);

    contentDiv.appendChild(toggleDiv);

    headerDiv.appendChild(textDiv);
    headerDiv.appendChild(buttonDiv);
    buttonDiv.appendChild(toggleButton);
    // toggleButton.appendChild(toggleImg);
    textDiv.appendChild(foodName);
    textDiv.appendChild(dateText);

    toggleDiv.appendChild(foodCategory);
    toggleDiv.appendChild(foodDescription);
    toggleDiv.appendChild(claimButton);

    $("#card-list").prepend(cardDiv);

    /** Clearing Forms */
    $('#postForm').trigger('reset');

    /** Hides Modal */
    if ($('#itemModal').is(':visible')) {
      $('#itemModal').modal('toggle');
    }
  }

});



// Creates a thumbnail when an image has been uploaded
// function handleFileSelect(evt) {
//     var files = evt.target.files; // FileList object

//     // Only process image files.
//   if (files[0].type.match('image.*')) {

//         var reader = new FileReader();

//        // Closure to capture the file information.
//         reader.onload = (function (theFile) {
//             return function (e) {
//                 // Render thumbnail.
//                 var span = document.createElement('span');
//                 span.innerHTML = ['<img class="thumb" src="', e.target.result,
//                     '" title="', escape(theFile.name), '"/>'].join('');
//                 document.getElementById("output").appendChild(span);
//             };
//         })(files[0]);

//        // Read in the image file as a data URL.
//        reader.readAsDataURL(files[0]);
//     }
// }
// document.getElementById('file-input').addEventListener('change', handleFileSelect, false);
=======
  var cardDiv = document.createElement("div");
  cardDiv.setAttribute("id", `card${id}`);
  cardDiv.setAttribute("class", "cardContainer");

  var contentDiv = document.createElement("div");
  contentDiv.setAttribute("class", "contentDiv");

  var headerDiv = document.createElement("div");
  headerDiv.setAttribute("class", "header-Div");
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

  var toggleButton = document.createElement("button");
  toggleButton.setAttribute("data-toggle", "collapse");
  toggleButton.setAttribute("data-target", `#collapseDiv${id}`);
  toggleButton.setAttribute("class", "glyphicon glyphicon glyphicon-option-vertical collapse-button");

  // var toggleImg = document.createElement("img");
  // toggleImg.src = "./Pictures/chevron-down.png";

  var toggleDiv = document.createElement("div");
  toggleDiv.setAttribute("id", `collapseDiv${id}`);
  toggleDiv.setAttribute("class", "collapse");

  var foodCategory = document.createElement("p");
  foodCategory.innerHTML = foodGroup;
  //takes the contents of the description 
  var foodDescription = document.createElement("p");
  foodDescription.innerHTML = description;

  var imageDiv = document.createElement("div");
  imageDiv.setAttribute("class", "imgDiv");

  var foodImg = document.createElement("img");
  foodImg.setAttribute("class", "food-img");
  foodImg.src = `/images/${img}`;

  var claimForm = document.createElement("form");
  claimForm.setAttribute("class", "claim-form");

  var claimButton = document.createElement("input");
  claimButton.setAttribute("id", `claimButton${id}`);
  claimButton.setAttribute("class", "claim-button");
  claimButton.setAttribute("type", "Submit");
  claimButton.setAttribute("value", "Claim");

  cardDiv.appendChild(imageDiv);
  imageDiv.appendChild(foodImg);
  cardDiv.appendChild(headerDiv);
  cardDiv.appendChild(contentDiv);

  contentDiv.appendChild(toggleDiv);

  headerDiv.appendChild(textDiv);
  headerDiv.appendChild(buttonDiv);
  buttonDiv.appendChild(toggleButton);
  // toggleButton.appendChild(toggleImg);
  textDiv.appendChild(foodName);
  textDiv.appendChild(dateText);

  toggleDiv.appendChild(foodCategory);
  toggleDiv.appendChild(foodDescription);
  toggleDiv.appendChild(claimForm);

  claimForm.appendChild(claimButton);
  $("#card-list").prepend(cardDiv);

  /** Clearing Forms */
  $('#postForm').trigger('reset');

  /** Hides Modal */
  if ($('#itemModal').is(':visible')) {
    $('#itemModal').modal('toggle');
  }
}
>>>>>>> 266bd120df042cb231d7033cb093d655ad8dacc0
