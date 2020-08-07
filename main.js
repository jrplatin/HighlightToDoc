var spreadsheetId = null;
var API_KEY = 'AIzaSyCx8_9Y-HlhAHl1JfZh7Y2QmIwLATIV_3c';

let menuToSpreadsheet = new Map();

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

changeSpreadSheetId = function (word) {
  var selectedId = menuToSpreadsheet.get(word.menuItemId);
  spreadsheetId = selectedId;
}

listSheets = function () {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    var query = "mimeType='application/vnd.google-apps.spreadsheet'";

    var params = `?q=${encodeURIComponent(query)}`;
    let init = {
      method: 'GET',
      async: false,
      headers: {
        Authorization: 'Bearer ' + token,
      }
    };
    fetch('https://www.googleapis.com/drive/v3/files' + params, init)
      .then((response) => response.json())
      .then(function (data) {
        for (var key in data.files) {
          if (key < 20) {
            var obj = data.files[key];
            menuToSpreadsheet.set(parseInt(key) + 4, obj.id);
            chrome.contextMenus.create({
              title: obj.name,
              parentId: "linkNotebook",
              contexts: ["selection"],
              onclick: changeSpreadSheetId
            });
          }

        }

      });
  });

};

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

  if (spreadsheetId === null) {
    alert('Please choose a spreadsheet!');
  } else {
    var rowNumber = null;
    var query = word.selectionText;
    chrome.identity.getAuthToken({ interactive: true }, function (token) {

      let getRequest = {
        method: 'GET',
        async: false,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        contentType: 'json',
      };
      fetch('https://sheets.googleapis.com/v4/spreadsheets/' + spreadsheetId + '/values/Sheet1!A1:D', getRequest)
        .then((response) => response.json())
        .then(function (data) {
          rowNumber = parseInt(data.values.length) + 1;
        }).then(function () {

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
          let request = {
            method: 'PUT',
            async: false,
            body: JSON.stringify(params),
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json'
            },
            contentType: 'json',
          };
          fetch('https://sheets.googleapis.com/v4/spreadsheets/' + spreadsheetId + '/values/A' + String(rowNumber) + '?valueInputOption=USER_ENTERED&key=' + API_KEY, request)
        })

    });
  }
};



listSheets();

chrome.contextMenus.create({
  title: "Change Note Sheet",
  id: "linkNotebook",
  contexts: ["selection"]
});


chrome.contextMenus.create({
  title: "Create New Sheet",
  contexts: ["selection"],
  onclick: createNewSheet
});


chrome.contextMenus.create({
  title: "Take Note",
  contexts: ["selection"],
  onclick: takeNote
})









