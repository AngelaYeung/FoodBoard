
var socket;

$(document).ready(() => {

  socket = io();
  var sessionID = getSessionID('connect.sid');

  $(window).on('load', () => {

    socket.emit('my claims', {
      sessionID: sessionID,
    });
  });
  socket.on('my claims return', (item) => {
    var role = item.role;
    var rows = item.rows;
    var claimerID = item.claimerUserID;
    console.log(item.claimerUserID);
    for (var i = 0; i < rows.length; i++) {
      createCardNoClaim(rows[i].itemID, rows[i].foodName, rows[i].foodDescription, rows[i].foodExpiryTime,
        rows[i].foodGroup, rows[i].foodImage);
    };
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
 *         FOOD BOARD AUTO-DELETE FEATURE - CLIENT SIDE
 * 
 *************************************************************************/
  socket.on('delete expired posts', (deletedItems) => {
    for (let i = 0; i < deletedItems.rows.length; i++) {
      itemDeleted(deletedItems.rows[i].itemID);
    }
  });
});
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
 * Creates Card from FoodItem Table without a 'Claim' Button. Included a unclaim button that is binded to the unclaim function.
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
                <input id="${id}" class="delete-button" type="button" value="UNCLAIM" onclick="unclaimItem(this.id)">
            </form>
            <p></p>
        </div>
    </div>`);
  /** Clearing Forms */
  $('#postForm').trigger('reset');
};
function formatDate(dateTime) {
  var expiryDate = new Date(dateTime);
  console.log('Expiry date', expiryDate);
  var today = new Date(Date.now());
  console.log('today', today);
  var formatedDate = moment(expiryDate).fromNow();
  return formatedDate;
};

function itemDeleted(id) {
  $(`#confirmDeleteModal`).modal('hide');
  $(`#status${id}`).attr("src", "../../Pictures/garbage-can.png");
  $(`#status${id}`).css("transform", "translate(86%, -145%)");

  $(`#status${id}`).fadeIn("300", () => {
    $(`#card${id}`).fadeOut("500", () => {
      $(`#card${id}`).remove();
    });
  });
};

function unclaimItem(cardID) {
  var input = $(`#dateTime${cardID}`).text();
  if (validateDate(input)) {
    console.log("The cardID is:", cardID);
    let sessionID = getSessionID('connect.sid');
    socket.emit('unclaim item', {
      cardID: cardID,
      sessionID: sessionID
    });

    $(`#status${cardID}`).attr("src", "../../Pictures/unclaim.png");
    $(`#status${cardID}`).css("top", "33%");
    $(`#status${cardID}`).css("left", "33%");

    $(`#status${cardID}`).fadeIn("300", () => {
      $(`#card${cardID}`).fadeOut("500", () => {
        $(`#card${cardID}`).remove();
      });
    });
  } else {
    alert("The card no longer exists. Please refresh the page");
  };
};

/**
 * Returns true if the input time is larger than the current time --> it is a valid date
 * , otherwise returns false.
 * @param {*} dateInput 
 */
function validateDate(dateInput) {

  var input = new Date(dateInput).getTime(); //user input time converted to milliseconds
  var currentTime = Date.now(); //current time in milliseconds
  console.log('input > currentTime:', (input > currentTime));
  return (input > currentTime);
};

