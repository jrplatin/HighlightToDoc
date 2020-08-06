var rowNumber = 0;
var spreadsheetId = null;
var API_KEY = 'AIzaSyCx8_9Y-HlhAHl1JfZh7Y2QmIwLATIV_3c';

var today = new Date();
var hour = String(today.getHours());
var minutes = String(today.getMinutes());
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();
today = mm + '/' + dd + '/' + yyyy + " " + hour + ':' + minutes;
dateOnly = mm + '/' + dd + '/' + yyyy;

decideIfTakeNote = function (word) {
  if (!spreadsheetId) {
    createNewSheet(word);
  } else {
    takeNote(word);
  }
}

createNewSheet = function (word) {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {

    let init = {
      method: 'POST',
      async: false,
      headers: {
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        properties: {
          title: "Your Notes From " + dateOnly
        }
      })
    };
    fetch('https://sheets.googleapis.com/v4/spreadsheets/', init)
      .then((response) => response.json())
      .then(function (data) {
        spreadsheetId = data.spreadsheetId;
        takeNote(word);
      });

});

};

takeNote = function (word) {
  console.log(spreadsheetId);
  var query = word.selectionText;
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    var params;
    if (rowNumber === 0) {
      params = {
        'values': [
          ['Date', 'Note'],
          [today, query],
        ]

      };
    } else {
      params = {
        'values': [
          [today, query]
        ]
      };
    }

    rowNumber++;


    let request = {
      method: 'PUT',
      async: true,
      body: JSON.stringify(params),
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      contentType: 'json',
    };
    fetch('https://sheets.googleapis.com/v4/spreadsheets/' + spreadsheetId + '/values/A' + String(rowNumber) + '?valueInputOption=USER_ENTERED&key=' + API_KEY, request)
      .then((response) => response.json())
      .then(function (data) {
        //console.log(data);
        //Returns spreadsheet ID, update tange, cols and rows
      });
  });
};




chrome.contextMenus.create({
  title: "Take Note",
  contexts: ["selection"],
  onclick: decideIfTakeNote
})









