// needs to be declared as a global variable to be in same scope as claimItem(), deleteItem()
var socket;

$(window).on('load', () => {
  window.scroll(0, 5);
});
$(document).ready(function () {
  var sessionID = getSessionID('connect.sid');
  console.log('sessionID', sessionID);

  socket = io();
  const uploader = new SocketIOFileUpload(socket);
  var image_name;

  /*************************************************************************
   * 
   *         FOOD BOARD POST FEATURE - CLIENT SIDE
   * 
   *************************************************************************/

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


  /** Sends data from post-form to server.js */
  $('#submit').click(function () {
    console.log('Submit triggered!');

    if ($('#itemModal').is(':visible')) {
      $('#itemModal').modal('toggle');
    }

    if ($('#name').val().toLowerCase() === 'ilovefoodboard') {
      window.location.href = ('/snake');

    } else {
      socket.emit('post item', {
        name: $('#name').val(),
        description: $('#description').val(),
        dateTime: $('#datetimepicker').val(),
        foodgrouping: $('input[name=foodgrouping]:checked').val(),
        image: `${image_name}.png`,
        sessionID: sessionID,
      });
    }
    return false;
  });

  socket.on('post item return', (item) => {
    createCardNoClaim(item.id, item.name, item.description, item.dateTime, item.foodgrouping, item.image);
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

    console.log('Client: page loaded:', sessionID);
    socket.emit('page loaded', {
      sessionID: sessionID,
    });
  });

  socket.on('load foodboard', (items) => {
    var role = items.role; // their role as administrator or user
    var userID = items.userID; // whos logged in
    var rows = items.rows;
    console.log("LOAD: ROWS: ", rows);
    for (var i = 0; i < rows.length; i++) {
      console.log('userID: ', userID);
      console.log(`rows[${i}].Users_user: `, rows[i].Users_userID);
      if (role === 0) {
        if (rows[i].Users_userID === userID) {
          createCardNoClaim(rows[i].itemID, rows[i].foodName, rows[i].foodDescription, rows[i].foodExpiryTime,
            rows[i].foodGroup, rows[i].foodImage);
        } else {
          createCardBothButtons(rows[i].itemID, rows[i].foodName, rows[i].foodDescription, rows[i].foodExpiryTime,
            rows[i].foodGroup, rows[i].foodImage);
        }
      } else {
        if (rows[i].Users_userID === userID) {
          createCardNoClaim(rows[i].itemID, rows[i].foodName, rows[i].foodDescription, rows[i].foodExpiryTime,
            rows[i].foodGroup, rows[i].foodImage);
        } else {
          createCardNoDelete(rows[i].itemID, rows[i].foodName, rows[i].foodDescription, rows[i].foodExpiryTime,
            rows[i].foodGroup, rows[i].foodImage);
        }
      }
    }
  });

  socket.on('myposts', (items) => {
    let userID = items.userID;
    let rows = items.rows;
    for (let i = 0; i < rows.length; i++) {
      createCardNoClaim(rows[i].itemID, rows[i].foodName, rows[i].foodDescription, rows[i].foodExpiryTime, rows[i].foodGroup, rows[i].foodImage);
    }
  });

  /*************************************************************************
   * 
   *         FOOD BOARD DELETE FEATURE - CLIENT SIDE
   * 
   *************************************************************************/
  socket.on('delete return', (itemID) => {
    itemDeleted(itemID); //deletes the item
  });

  /*************************************************************************
   * 
   *         FOOD BOARD CLAIM FEATURE - CLIENT SIDE
   * 
   *************************************************************************/

  socket.on('claim return', (itemID) => {
    itemClaimed(itemID);
  });

  /************************************************
* 
*              SEARCH FEATURE
* 
*************************************************/

  /**
   * Handles search bar clear button toggle
   */
  $('#search-bar').on('keyup', (event) => {
    console.log('searchbar');
    if ($('#search-bar').val() !== '') {
      $('#search-bar-btn-reset').show();
    } else {
      $('#search-bar-btn-reset').hide();
    }
  });

  $('#search-bar-btn-reset').on('click', () => {
    $('#search-bar-btn-reset').hide();
  });

  $(window).on('scroll', () => {
    if ($(window).scrollTop() < 2) {
      $('#search-bar-container').slideDown(150);
      $('#card-list').animate({ 'margin-top': '2%', 'padding-top' : '0%' }, 25, 'linear');
      $('#search-bar-container').animate({'padding-top' : '15%'}, 25, 'linear');

    } else {
      $('#search-bar-container').slideUp(150);
      $('#search-bar-container').animate({'padding-top' : '15%'}, 25, 'linear');
      $('#card-list').animate({ 'margin-top': '10%', 'padding-top' : '2%' }, 25, 'linear');
    }
  });

  $('#search-bar-form').on('submit', (event) => {
    event.preventDefault();
  });
});


/**
 * Removes the claimed items from the board.
 * @param {number} id 
 */
function itemClaimed(id) {
  $(`#card${id}`).remove();
};

/**
 * Sends emits the item id to the server.
 * @param {number} itemID 
 */
function claimItem(itemID) {
  let sessionID = getSessionID('connect.sid');
  socket.emit('claim item', {
    id: itemID,
    sessionID: sessionID,
  });
};

function deleteItem(itemID) {
  let sessionID = getSessionID('connect.sid');
  socket.emit('delete item', {
    id: itemID,
    sessionID: sessionID
  });
}

/**
 * Gets the session id. 
 * @param {string} name - name of the cookie session key we are grabbing (should be connect.sid)
 */
function getSessionID(name) {
  var cookie = getCookie(name);
  var sessionID = cookie.substring(4, cookie.lastIndexOf('.'));
  return sessionID;
}


/**
 * Gets the cookie of the particular session.
 * @param {string} name 
 */
function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) {
    return parts.pop().split(";").shift();
  }
};

function setPostImage(foodCategory, imgName) {
  if (imgName !== "undefined.png") {
    return `/images/${imgName}`;
  } else {
    switch (foodCategory) {
      case "Produce":
        return "../../Pictures/default_produce.png";
        break;
      case "Meat":
        return "../../Pictures/default_meat.png";
        break;
      case "Canned Goods":
        return "../../Pictures/default_food.png";
        break;
      case "Packaged":
        return "../../Pictures/default_packaged.png";
        break;
    }
  }
}

function itemDeleted(id) {
  $(`#card${id}`).remove();
}

/**
 * Creates Card from FoodItem Table without a 'Claim' Button.
 * @param {*} id 
 * @param {*} name 
 * @param {*} description 
 * @param {*} dateTime 
 * @param {*} foodGroup 
 * @param {*} img 
 */
function createCardNoClaim(id, name, description, dateTime, foodGroup, img) {
  $('#card-list').prepend(`
  <div id="card${id}" class="cardContainer">
    <div class="imgDiv">
        <img class="food-img" src="${setPostImage(foodGroup, img)}">
    </div>
    <div class="header-Div">
        <div class="row">
            <div class="col-xs-10">
                <h4>${name}</h4>
                <p>Expires ${formatDate(dateTime)}</p>
            </div>
            <div class="col-xs-2">
                <button data-toggle="collapse" data-target="#collapseDiv${id}" class="glyphicon glyphicon glyphicon-option-vertical collapse-button"
                    aria-expanded="false"></button>
            </div>
        </div>
    </div>
    <div class="contentDiv row">
        <div id="collapseDiv${id}" class="col-xs-12 collapse" aria-expanded="true" style="">
            <p>${foodGroup}</p>
            <p>${description}</p>
            <form class="claim-form"
                action="javascript:void(0);">
                <input id="${id}" class="delete-button" type="button" value="DELETE" onclick="deleteItem(this.id)">
            </form>
            <p></p>
        </div>
    </div>`);
  /** Clearing Forms */
  $('#postForm').trigger('reset');
}

function formatDate(dateTime) {
  var expiryDate = new Date(dateTime);
  console.log('Expiry date', expiryDate);
  var today = new Date(Date.now());
  console.log('today', today);
  var formatedDate = moment(expiryDate).fromNow();
  return formatedDate;
};
/**
 * Creates Card from FoodItem Table without a 'Delete' Button.
 * @param {*} id 
 * @param {*} name 
 * @param {*} description 
 * @param {*} dateTime 
 * @param {*} foodGroup 
 * @param {*} img 
 */
function createCardNoDelete(id, name, description, dateTime, foodGroup, img) {
  $('#card-list').prepend(`
  <div id="card${id}" class="cardContainer">
    <div class="imgDiv">
        <img class="food-img" src="${setPostImage(foodGroup, img)}">
    </div>
    <div class="header-Div">
        <div class="row">
            <div class="col-xs-10">
                <h4>${name}</h4>
                <p>Expires ${formatDate(dateTime)}</p>
            </div>
            <div class="col-xs-2">
                <button data-toggle="collapse" data-target="#collapseDiv${id}" class="glyphicon glyphicon glyphicon-option-vertical collapse-button"
                    aria-expanded="false"></button>
            </div>
        </div>
    </div>
    <div class="contentDiv row">
        <div id="collapseDiv${id}" class="col-xs-12 collapse" aria-expanded="true" style="">
            <p>${foodGroup}</p>
            <p>${description}</p>
            <form class="claim-form"
                action="javascript:void(0);">
                <input id="${id}" class="claim-button" type="button" value="CLAIM" onclick="claimItem(this.id)">
            </form>
            <p></p>
        </div>
    </div>`);
  /** Clearing Forms */
  $('#postForm').trigger('reset');
}

/**
 * Creates Card from FoodItem Table with both buttons.
 * @param {*} id 
 * @param {*} name 
 * @param {*} description 
 * @param {*} dateTime 
 * @param {*} foodGroup 
 * @param {*} img 
 */
function createCardBothButtons(id, name, description, dateTime, foodGroup, img) {
  $('#card-list').prepend(`
  <div id="card${id}" class="cardContainer">
    <div class="imgDiv">
        <img class="food-img" src="${setPostImage(foodGroup, img)}">
    </div>
    <div class="header-Div">
        <div class="row">
            <div class="col-xs-10">
                <h4>${name}</h4>
                <p>Expires ${formatDate(dateTime)}</p>
            <div class="col-xs-2">
                <button data-toggle="collapse" data-target="#collapseDiv${id}" class="glyphicon glyphicon glyphicon-option-vertical collapse-button"
                    aria-expanded="false"></button>
            </div>
        </div>
    </div>
    <div class="contentDiv row">
        <div id="collapseDiv${id}" class="col-xs-12 collapse" aria-expanded="true" style="">
            <p>${foodGroup}</p>
            <p>${description}</p>
            <form class="claim-form"
                action="javascript:void(0);">
                <input style="width:50%; border-bottom-left-radius:0px; " id="${id}" class="claim-button" type="button" value="CLAIM" onclick="claimItem(this.id)"><input style="width:50%;  border-bottom-right-radius:0px;"  id="${id}" class="delete-button" type="button" value="DELETE" onclick="deleteItem(this.id)">
            </form>
            <p></p>
        </div>
    </div>`);
  /** Clearing Forms */
  $('#postForm').trigger('reset');
}

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