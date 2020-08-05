var today = new Date();
var hour = String(today.getHours());
var minutes = String(today.getMinutes());
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = hour + ':' + minutes + '/' + mm + '/' + dd + '/' + yyyy;

var rowNumber = 1;
searchUrbanDict = function(word){
  rowNumber++;
  var query = word.selectionText;
  chrome.identity.getAuthToken({interactive: true}, function(token) {
    var params = {
        'values': [
            ['Text','Text'],
            [today, query],
        ]
    };
    let init = {
        method: 'PUT',
        async: true,
        body: JSON.stringify(params),
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        contentType: 'json',
    };
    fetch('https://sheets.googleapis.com/v4/spreadsheets/143Vfr1Tgbsa2Q4dkSRi1YtgycW86A01gu8FjqLb63gE/values/A' + String(rowNumber) + '?valueInputOption=USER_ENTERED&key=AIzaSyCx8_9Y-HlhAHl1JfZh7Y2QmIwLATIV_3c', init)
        .then((response) => response.json())
        .then(function(data) {
            //console.log(data);
            //Returns spreadsheet ID, update tange, cols and rows
        });
    });
  
};

chrome.contextMenus.create({
  title: "Take Note",
  contexts:["selection"],
  onclick: searchUrbanDict
});

