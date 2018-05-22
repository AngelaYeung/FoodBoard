
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
}); //closes $(document).ready();
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
        <img class="food-img" src="${setPostImage(foodGroup, img)}">
        <p id="status${id}" class="status-text" style="display:none;"></p>
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

function unclaimItem(cardID) {
  console.log("The cardID is:", cardID);
  let sessionID = getSessionID('connect.sid');
  socket.emit('unclaim item', {
    cardID: cardID,
    sessionID: sessionID
  });
  
  $(`#status${cardID}`).text("UNCLAIMED");
  $(`#status${cardID}`).css("transform", "rotate(-25deg) translate(25%, -170%)");

  $(`#status${cardID}`).fadeIn("300", () => {
    $(`#card${cardID}`).fadeOut("500", () => {
      $(`#card${cardID}`).remove();
    });
  });
};
