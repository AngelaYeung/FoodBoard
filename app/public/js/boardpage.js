// needs to be declared as a global variable to be in same scope as claimItem(), deleteItem()
var socket;

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

  socket = io();
  const uploader = new SocketIOFileUpload(socket);
  var image_name;

  /*************************************************************************
   * 
   *         FOOD BOARD POST FEATURE - CLIENT SIDE
   * 
   *************************************************************************/
  //#region post feature

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

        }
      }
    });

  } else {
    console.log("File Upload Not Supported");

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
    uploader.listenOnSubmitBlob(document.getElementById('submit'), fileData, `${image_name}.${png}`);
  }

  /** Sends data from post-form to server.js */
  $('#submit').click(function () {

    $('.invalid-feedback').hide();

    if ($('#name').val().toLowerCase() === 'ilovefoodboard') {
      window.location.href = ('/snake');
    }

    //submits the form if the date is valid
    if (validateDate($('#datetimepicker').val()) && isFormFilled()) {

      // closes the form modal after the submit button is clicked
      if ($('#itemModal').is(':visible')) {
        $('#itemModal').modal('toggle');
      };

      socket.emit('post item', {
        name: $('#name').val(),
        description: $('#description').val(),
        dateTime: $('#datetimepicker').val(),
        foodgrouping: $('input[name=foodgrouping]:checked').val(),
        image: `${image_name}.png`,
        sessionID: getSessionID('connect.sid'),
      });
      $('#postForm').trigger('reset');
    } else {

      if (!validateDate($('#datetimepicker').val())) {
        $("#invalid-datetime").show();
      } else {
        $("#invalid-datetime").hide();
      }

      if (($("#name").val().trim().length === 0)) {
        $("#invalid-name").show();
      } else {
        $("#invalid-name").hide();
      }

      if (($("#description").val().trim().length === 0)) {
        $("#invalid-description").show();
      } else {
        $("#invalid-description").hide();
      }

      if (($("#file-input").get(0).files.length === 0)) {
        $("#invalid-file-input").show();
      } else {
        $("#invalid-file-input").hide();
      }

    }
    return false;
  });

  socket.on('post item return', (item) => {
    $('#empty-foodboard').css("display", "none");
    if (getSessionID('connect.sid') === item.sessionID) {
      createCardNoClaim(item.id, item.name, item.description, item.dateTime, item.foodgrouping, item.image);
    } else {
      createCardNoDelete(item.id, item.name, item.description, item.dateTime, item.foodgrouping, item.image);
    }
  });
  //#endregion post feature

  /*************************************************************************
   * 
   *         FOOD BOARD LOAD FEATURE - CLIENT SIDE
   * 
   *************************************************************************/
  //#region load feature
  /**
   * When the window is loaded, trigger websocket event for server to fetch foodboard posts
   * from the data base. 
   */
  $(window).on('load', () => {
    socket.emit('page loaded', {
      sessionID: getSessionID('connect.sid'),
    });
  });

  socket.on('load foodboard', (items) => {
    var role = items.role; // their role as administrator or user
    var userID = items.userID; // whos logged in the active session 
    var rows = items.rows;
    for (var i = 0; i < rows.length; i++) {
      if (role == 0) {
        if (rows[i].Users_userID == userID) {
          createCardNoClaim(rows[i].itemID, rows[i].foodName, rows[i].foodDescription, rows[i].foodExpiryTime,
            rows[i].foodGroup, rows[i].foodImage);
        } else {
          createCardBothButtons(rows[i].itemID, rows[i].foodName, rows[i].foodDescription, rows[i].foodExpiryTime,
            rows[i].foodGroup, rows[i].foodImage);
        }
      } else {
        if (rows[i].Users_userID == userID) {
          createCardNoClaim(rows[i].itemID, rows[i].foodName, rows[i].foodDescription, rows[i].foodExpiryTime,
            rows[i].foodGroup, rows[i].foodImage);
        } else {
          console.log("REGULAR USER LOAD FEATURE: CREATING CARD NO DELETE");
          createCardNoDelete(rows[i].itemID, rows[i].foodName, rows[i].foodDescription, rows[i].foodExpiryTime,
            rows[i].foodGroup, rows[i].foodImage);
        }
      }
    }
    isBoardEmpty();
  });


  /*************************************************************************
 * 
 *         FOOD BOARD AUTO-DELETE FEATURE - CLIENT SIDE
 * 
 *************************************************************************/
  socket.on('delete expired posts', (deletedItems) => {
    for (let i = 0; i < deletedItems.rows.length; i++) {
      itemDeleted(deletedItems.rows[i].itemID);
    }
  });
  
  socket.on('empty foodboard', () => {
    isBoardEmpty();
  });

  socket.on('myposts', (items) => {
    let userID = items.userID;
    let rows = items.rows;
    for (let i = 0; i < rows.length; i++) {
      createCardNoClaim(rows[i].itemID, rows[i].foodName, rows[i].foodDescription, rows[i].foodExpiryTime, rows[i].foodGroup, rows[i].foodImage);
    }
  });

  //#endregion load feature

  /*************************************************************************
   * 
   *         FOOD BOARD DELETE FEATURE - CLIENT SIDE
   * 
   *************************************************************************/
  //#region delete feature
  socket.on('delete return', (itemID) => {
    itemDeleted(itemID); //deletes the item
  });

  /*************************************************************************
   * 
   *         FOOD BOARD CLAIM FEATURE - CLIENT SIDE
   * 
   *************************************************************************/
  //#region claim feature
  socket.on('claim return', (itemID) => {
    itemClaimed(itemID);
  });
});
//#endregion search feature

/**
 * Returns true if the add item form is filled
 */
function isFormFilled() {
  return (!($("#name").val().length === 0) &&
    !($("#description").val().length === 0) &&
    !($("#datetimepicker").val().length === 0) &&
    !($('#file-input').get(0).files.length === 0));

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




/**
 * Returns true if the input time is larger than the current time --> it is a valid date
 * , otherwise returns false.
 * @param {*} dateInput 
 */
function validateDate(dateInput) {

  var input = new Date(dateInput).getTime(); //user input time converted to milliseconds
  var currentTime = Date.now(); //current time in milliseconds
  return (input > currentTime);
};


//#region create card functions

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
        <img class="food-img" src="/images/${img}">
        <img id="status${id}" class="status-text" style="display:none;">
    </div>
    <div class="header-Div">
        <div class="row">
            <div class="col-xs-10">
                <h4>${name}</h4>
                <p>Expires ${formatDate(dateTime)}</p>
                <p id="dateTime${id}" style="display:none">${dateTime}</p>
            </div>
            <div class="col-xs-2">
                <button data-toggle="collapse" data-target="#collapseDiv${id}" class="glyphicon glyphicon glyphicon-option-vertical collapse-button"
                    aria-expanded="false"></button>
            </div>
        </div>
    </div>
    <div class="contentDiv row">
        <div id="collapseDiv${id}" class="col-xs-12 collapse" aria-expanded="true" style="">
            <p style="display:none">${foodGroup}</p>
            <p>${description}</p>
            <form class="claim-form"
                action="javascript:void(0);">
                <input id="${id}" class="claim-button" type="button" value="CLAIM" onclick="claimItem(this.id)">
            </form>
            <p></p>
        </div>
    </div>`);
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
function createCardBothButtons(id, name, description, dateTime, foodGroup, img) {
  $('#card-list').prepend(`
  <div id="card${id}" class="cardContainer">
    <div class="imgDiv">
        <img class="food-img" src="/images/${img}">
        <img id="status${id}" class="status-text" style="display:none;">
    </div>
    <div class="header-Div">
        <div class="row">
            <div class="col-xs-10">
                <h4>${name}</h4>
                <p>Expires ${formatDate(dateTime)}</p>
                <p id="dateTime${id}" style="display:none">${dateTime}</p>
            </div>
            <div class="col-xs-2">
                <button data-toggle="collapse" data-target="#collapseDiv${id}" class="glyphicon glyphicon glyphicon-option-vertical collapse-button"
                    aria-expanded="false"></button>
            </div>
        </div>
    </div>
    <div class="contentDiv row">
        <div id="collapseDiv${id}" class="col-xs-12 collapse" aria-expanded="true" style="">
            <p style="display:none">${foodGroup}</p>
            <p>${description}</p>
            <form class="claim-form"
                action="javascript:void(0);">
                <input style="width:50%; border-bottom-left-radius:0px; " id="${id}" class="claim-button" type="button" value="CLAIM" onclick="claimItem(this.id)"><input style="width:50%;  border-bottom-right-radius:0px;"  id="${id}" class="delete-button" type="button" value="DELETE" onclick="deleteItem(this.id)">
            </form>
            <p></p>
        </div>
    </div>`);
};
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
    <img class="food-img" src="/images/${img}">
    <img id="status${id}" class="status-text" style="display:none;">
    </div>
    <div class="header-Div">
        <div class="row">
            <div class="col-xs-10">
                <h4>${name}</h4>
                <p>Expires ${formatDate(dateTime)}</p>
                <p id="dateTime${id}" style="display:none">${dateTime}</p>
            </div>
            <div class="col-xs-2">
                <button data-toggle="collapse" data-target="#collapseDiv${id}" class="glyphicon glyphicon glyphicon-option-vertical collapse-button"
                    aria-expanded="false"></button>
            </div>
        </div>
    </div>
    <div class="contentDiv row">
        <div id="collapseDiv${id}" class="col-xs-12 collapse" aria-expanded="true" style="">
            <p style="display:none">${foodGroup}</p>
            <p>${description}</p>
            <form class="claim-form"
                action="javascript:void(0);">
                <input id="${id}" class="delete-button" type="button" value="DELETE" onclick="deleteRoadBlock(this.id)">
            </form>
            <p></p>
        </div>
    </div>`);
}

function deleteItem(itemID) {
  let sessionID = getSessionID('connect.sid');
  var input = $(`#dateTime${itemID}`).text();
  if (validateDate(input)) {
    socket.emit('delete item', {
      id: itemID,
      sessionID: sessionID
    });
  } else {
    alert("The card no longer exists. Please refresh the page");
  }
};

/**
 * Removes the card from the board (client-side)
 * @param {*} id 
 */
function itemDeleted(id) {
  $(`#confirmDeleteModal`).modal('hide');
  $(`${id}`).attr('disabled', 'disabled');
  $(`#status${id}`).attr("src", "../../Pictures/garbage-can.png");
  $(`#status${id}`).css("top", "28%");
  $(`#status${id}`).css("left", "33%");
  
  $(`#status${id}`).animate().fadeIn("300", () => {
   $(`#card${id}`).fadeOut("500", () => {
      $(`#card${id}`).remove();
      isBoardEmpty();
    });
  });
};

function deleteRoadBlock(id) {
  var modalHtml = `<div id="confirmDeleteModal${id}" class="modal confirmDeleteModal fade">
	<div class="modal-dialog modal-confirm">
		<div class="modal-content">
			<div class="modal-header">
      <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				<h4 class="modal-title">Are you sure?</h4>	
			</div>
			<div class="modal-body">
				<p>Do you really want to delete this post? This process cannot be undone.</p>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn" data-dismiss="modal">Cancel</button>
				<button type="button" class="btn btn-danger" onclick="deleteItem(${id})">Delete</button>
			</div>
		</div>
	</div>`
  $(`#card${id}`).prepend(modalHtml);

  $(`#confirmDeleteModal${id}`).modal('show');
}
/**
 * Removes the claimed items from the board.
 * @param {number} id 
 */
function itemClaimed(id) {
  $(`#confirmDeleteModal${id}`).modal('hide');
  $(`#status${id}`).attr("src", "../../Pictures/checkmark.png");
  $(`#status${id}`).css("top", "35%");
  $(`#status${id}`).css("left", "36%");
  
  $(`#status${id}`).fadeIn("300", () => {
    $(`#card${id}`).fadeOut("500", () => {
      $(`#card${id}`).remove();
      isBoardEmpty();
    });
  });
};

/**
 * Sends emits the item id to the server.
 * @param {number} itemID 
 */
function claimItem(itemID) {
  let sessionID = getSessionID('connect.sid');
  var input = $(`#dateTime${itemID}`).text();

  if (validateDate(input)) {
    socket.emit('claim item', {
      id: itemID,
      sessionID: sessionID,
    });
  } else {
    alert("The card no longer exists. Please refresh the page");
  }
};
//#endregion claim feature

function formatDate(dateTime) {
  var expiryDate = new Date(dateTime);
  var today = new Date(Date.now());
  var formatedDate = moment(expiryDate).fromNow();
  return formatedDate;
};

function isBoardEmpty() {
  if( $('#card-list').is(':empty') || $.trim( $('#card-list').html() ).length === 0) {
    flipEmoji();
    $('#empty-foodboard').show();
    $('#empty-foodboard').css('display', 'block');
  } else {
    $('#empty-foodboard').hide();
    $('#empty-foodboard').css('display', 'none');
  }
};


function flipEmoji() {
  let face = Math.floor(Math.random() * 6);
  console.log(face);
  switch (face) {
    case 0:
    console.log('case 0');
      $('.emoji').html('~(˘▾˘~)');
      break;
    case 1:
    console.log('case 1');
      $('.emoji').html('⚆ _ ⚆');
      break;
    case 2:
        console.log('case 2');

      $('.emoji').html('\ (•◡•) /');
      break;
    case 3:
    console.log('case 3');

      $('.emoji').html('(ﾉ◕ヮ◕)ﾉ');
      break;
    case 4:
    console.log('case 4');

      $('.emoji').html("(ʘᗩʘ')");
      break;
    case 5:
    console.log('case 5');

      $('.emoji').html('ʕ•ᴥ•ʔ');
      break;
    default:
      $('.emoji').html('~(˘▾˘~)');
      break;
  }
};