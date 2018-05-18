// needs to be declared as a global variable to be in same scope as claimItem(), deleteItem()
var socket;

$(document).ready(function () {
  var sessionID = getSessionID('connect.sid');
  console.log('sessionID', sessionID);

  socket = io();
  const uploader = new SocketIOFileUpload(socket);
  var image_name;


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

    console.log('Myposts loading.....', sessionID);
    socket.emit('my posts', {
      sessionID: sessionID,
    });
  });

  socket.on('load my posts', (items) => {
    var role = items.role; // their role as administrator or user
    var userID = items.userID; // whos logged in
    var rows = items.rows;
    console.log("MYPOSTS JAVASCRIPT EVENT: items: ", items);
    for (var i = 0; i < rows.length; i++) {
      createCardNoClaim(rows[i].itemID, rows[i].foodName, rows[i].foodDescription, rows[i].foodExpiryTime,
        rows[i].foodGroup, rows[i].foodImage);
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
});

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