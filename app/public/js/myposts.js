// needs to be declared as a global variable to be in same scope as claimItem(), deleteItem()
var socket;

$(document).ready(function () {
  var sessionID = getSessionID('connect.sid');

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

    socket.emit('page loaded', {
      sessionID: getSessionID('connect.sid'),
    });
    socket.emit('my posts', {
      sessionID: sessionID,
    });
  });

  socket.on('load my posts', (items) => {
    var role = items.role; // their role as administrator or user
    var userID = items.userID; // whos logged in
    var rows = items.rows;

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
    $(`#card${itemID}`).attr('disabled', 'true');
    $(`#${itemID}`).attr('disabled', 'disabled');
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

function itemDeleted(id) {
  $(`#card${id}`).attr('disabled', 'true');
  $(`#${id}`).attr('disabled', 'disabled');
  $(`#confirmDeleteModal`).modal('hide');
  $(`#status${id}`).attr("src", "../../Pictures/garbage-can.png");
  $(`#status${id}`).css("top", "28%");
  $(`#status${id}`).css("left", "33%");

  $(`#status${id}`).fadeIn("300", () => {
    $(`#card${id}`).fadeOut("500", () => {
      $(`#card${id}`).remove();
    });
  });
};

function deleteRoadBlock(id) {
  var modalHtml = `<div id="confirmDeleteModal" class="modal confirmDeleteModal fade">
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

  $(`#confirmDeleteModal`).modal('show');
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
  /** Clearing Forms */
  $('#postForm').trigger('reset');
}

function formatDate(dateTime) {
  var expiryDate = new Date(dateTime);
  var today = new Date(Date.now());
  var formatedDate = moment(expiryDate).fromNow();
  return formatedDate;
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


