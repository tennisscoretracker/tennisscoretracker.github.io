
function addHomePageMatch(match)
{


    var players = match.players;
    var opponents = match.opponents;
    var date = match.getDateString();

    var matchDiv = document.createElement("span");
    matchDiv.className = "home-page-match";

    var deleteButton = document.createElement("button");
    deleteButton.className = "button match-delete-button";
    deleteButton.innerHTML = "&times;"
    deleteButton.onclick = function(e)
    {
        removeChildren(document.getElementById("yes-no-popup-text"));
        document.getElementById("yes-no-popup-text").appendChild(document.createTextNode("Are you sure you want to delete this match?"));
        document.getElementById("yes-no-popup-background").style.display="block";
        document.getElementById("yes-no-popup-yes-button").onclick= function()
        {
            document.getElementById("yes-no-popup-background").style.display="none";
            var matchId = match.id;
            localStorage.removeItem("match"+matchId);
            location.reload();
        }
        e.stopPropagation();
    };
    matchDiv.appendChild(deleteButton);

    var playerDiv = document.createElement("div");

    if(players.length == 2)
        playerDiv.appendChild(document.createTextNode(players[0] + " / " + players[1]));
    else if(players.length == 1)
        playerDiv.appendChild(document.createTextNode(players[0]));
    playerDiv.appendChild(document.createElement("br"));
    playerDiv.appendChild(document.createTextNode("vs"));
    playerDiv.appendChild(document.createElement("br"));
    if(opponents.length == 2)
        playerDiv.appendChild(document.createTextNode(opponents[0] + " / " + opponents[1]));
    else if(opponents.length == 1)
        playerDiv.appendChild(document.createTextNode(opponents[0]));
    playerDiv.className = "home-page-match-players"

    var dividerDiv = document.createElement("br");

    var dateDiv = document.createElement("div");
    dateDiv.className = "home-page-match-date";
    dateDiv.appendChild(document.createTextNode(date))


    matchDiv.appendChild(playerDiv);
    //matchDiv.appendChild(dividerDiv);
    matchDiv.appendChild(dateDiv)

    matchDiv.onclick = function(event)
    {
        sessionStorage.setItem("currentMatch", match.id);
        viewMatchDetails();
    };


    document.getElementById("home-page-matches").appendChild(matchDiv);
}
function homePageLoadAllMatches()
{
    var n = parseInt(localStorage.getItem("maxMatchID"));
    for(var i = 0; i < n; i++)
    {

        if(matchExists(i))
        {
            var match = loadMatch(i);
            addHomePageMatch(match)
        }
    }

    var createNewMatch = document.createElement("span");
    createNewMatch.className = "home-page-new-match";
    createNewMatch.id = "home-page-new-match";
    createNewMatch.appendChild(document.createTextNode("Create New Match"));
    createNewMatch.onclick = viewCreateMatch;
    document.getElementById("home-page-matches").appendChild(createNewMatch);

    var uploadNewMatch = document.createElement("span");
    uploadNewMatch.className = "home-page-upload-match";
    uploadNewMatch.id = "home-page-upload-match";
    uploadNewMatch.appendChild(document.createTextNode("Upload New Match"));
    uploadNewMatch.onclick = function()
    {
        document.getElementById("upload-file-popup-background").style.display="block";
    };
    document.getElementById("home-page-matches").appendChild(uploadNewMatch);

}

//based on https://www.youtube.com/watch?v=vBCU2Upno0c
async function uploadFile()
{
    var uploadFileText = document.getElementById("fileuploadtext").value;
    var jsonFile = JSON.parse(uploadFileText);


    var match = newMatch(jsonFile["players"], jsonFile["opponents"], []);
    var matchGroups = jsonFile["groups"];
    for(let groupName in matchGroups)
    {
        var g = matchGroups[groupName];
        new Group(match.groups, g["name"], g["selectionType"], g["items"]);
    }
    match.save();

    var points = jsonFile["points"];
    for(var i = 0; i < points.length; i++)
    {
        savePoint(points[i], match.id);
    }
    location.reload();
}
function initHomePage()
{
    if(localStorage.getItem("maxMatchID") === null)localStorage.setItem("maxMatchID", 0);
    homePageLoadAllMatches();
}

initHomePage()