checkBoxes = [];


function displayGroup(group, deleteFunction)
{
    var groupSelect = document.createElement("div");
    groupSelect.className = "create-match-group-selection";
    groupSelect.appendChild(document.createElement("br"));
    
    var title = document.createElement("h5");
    title.appendChild(document.createTextNode(group.name));
    groupSelect.appendChild(title);




    var row = document.createElement("div");
    row.className = "row";

    var leftSide = document.createElement("div");
    leftSide.className = "col-6 create-match-group-selection-left";
    var rightSide = document.createElement("div");
    rightSide.className = "col-6 create-match-group-selection-right"

    row.appendChild(leftSide);
    row.appendChild(rightSide);
    groupSelect.appendChild(row);






    groupSelect.appendChild(document.createElement("br"));


    for(var j = 0; j < group.items.length; j++)
    {
        rightSide.appendChild(document.createTextNode(group.items[j]));
        rightSide.appendChild(document.createElement("br"));
    }

    var itemContainer = document.createElement("div");
    itemContainer.className = "create-match-group-selection-item-container";

    var checkBox = document.createElement("input");
    checkBox.className = "create-match-group-selection-checkbox";
    checkBox.setAttribute("type","checkbox");
    checkBox.setAttribute("value",group.name);
    checkBoxes.push(checkBox);

    itemContainer.appendChild(checkBox);

    if(deleteFunction != null)
    {
        var deleteButton = document.createElement("button");
        deleteButton.className = "button btn-danger group-delete-button";
        
        deleteButton.innerHTML = "&times;";
        deleteButton.onclick = function()
        {
            removeChildren(document.getElementById("yes-no-popup-text"));
            document.getElementById("yes-no-popup-text").appendChild(document.createTextNode("Are you sure you want to delete this group?"));
            document.getElementById("yes-no-popup-background").style.display="block";
            document.getElementById("yes-no-popup-yes-button").onclick= function()
            {
                document.getElementById("yes-no-popup-background").style.display="none";
                deleteFunction();
                location.reload();

            }
            
        }
        //itemContainer.appendChild(document.createElement("br"));
        itemContainer.appendChild(deleteButton);
    }



    leftSide.appendChild(itemContainer);



    document.getElementById("groups-selection").appendChild(groupSelect);
}

function init()
{

    for(let key in groups)
    {
        displayGroup(groups[key]);
    }
    for(let key in customGroups)
    {
        let theKey = key;
        displayGroup(customGroups[key], function()
        {
            for(var i = 0; i< customGroups.length; i++)
            {
                if(customGroups[i].name == theKey)
                {
                    customGroups.splice(i,1);

                    break;
                }
            }
            saveCustomGroupsArray(customGroups);
        });
    }
}

function createMatch()
{
    groupsToKeepTrackOf = [];
    for(var i = 0; i < checkBoxes.length; i++)
    {
        if(checkBoxes[i].checked)
        {
            groupsToKeepTrackOf.push(checkBoxes[i].getAttribute("value"));
        }
        
    }


    var player1 = document.getElementById("p1Input").value.trim();
    var player2 = document.getElementById("p2Input").value.trim();
    var opponent1 = document.getElementById("o1Input").value.trim();
    var opponent2 = document.getElementById("o2Input").value.trim();


    var players = null;
    var opponents = null;
    if(player1 != "" && player2 != "" && opponent1 != "" && opponent2 != "")
    {
        //doubles
        players = [player1, player2];
        opponents = [opponent1, opponent2];
    }
    else if(player1 != "" && player2 == "" && opponent1 != "" && opponent2 == "")
    {
        //singles
        players = [player1];
        opponents = [opponent1];
    }
    else
    {
        //error
        alert("Either fill in player 1 and opponent 1 for singles, or fill in both players and both opponents for doubles");
        return;
    }

    validateInput(players.concat(opponents));

    newMatch(players, opponents, groupsToKeepTrackOf);
    //console.log(m);
    viewHome();




}
function createNewGroup()
{
    var name = document.getElementById("group-input-name").value;
    document.getElementById("group-input-name").value = "";
    if(name.trim() == "")
    {
        alert("You must input a name for this group.");
        return;
    }
    var options = [];
    for(var i = 1; i <= 6; i++)
    {
        var opt = document.getElementById("group-input-option-"+i).value.trim();
        if(opt != "" && opt != null)
        {
            options.push(opt);
        }
        document.getElementById("group-input-option-"+i).value="";
    }
    if(options.length < 1)
    {
        alert("You must provide some options for this group.");
        return;
    }
    var selectionMechanism = document.getElementById("radio-button").checked? "Radio" : "Checkbox";


    validateInput(options);
    validateInput(name);



    var g = new Group(null, name, selectionMechanism, options);
    var customGroups = getAllCustomGroups();
    customGroups.push(g);
    saveCustomGroupsArray(customGroups);
    document.getElementById("new-group-popup-background").style.display="none";
    location.reload();

}
function openCreateCustomGroup()
{
    document.getElementById("new-group-popup-background").style.display="block";
}
init();
