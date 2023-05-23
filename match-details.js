match = loadMatch(parseInt(sessionStorage.getItem("currentMatch")));
groupsToDisplay = {};
groupsCheckboxes = {};
currentPointNumber = -1;
allpoints = {};


deuceAdArray = ["Deuce", "Advantage (Ad)"];


function updatePointNumber()
{
    var h5 = document.getElementsByTagName("h5").item(0);
    removeChildren(h5);
    h5.appendChild(document.createTextNode("Point " + currentPointNumber));
    document.getElementsByClassName("viewing-previous-point-warning").item(0).style.display = isCurrentPoint() ? "none" : "block";
    document.getElementsByClassName("jump-to-current-point-button").item(0).style.display = isCurrentPoint() ? "none" : "inline-block";

}
function isCurrentPoint()
{
    return currentPointNumber == match.calculateNumPoints()+1;
}

function refresh()
{
    updatePointNumber();
    initFilters();
    loadFilters();
}

function unselectAll()//unselect all in the rally outcomes window
{
    for(let groupName in groupsCheckboxes)
    {
        for(let itemName in groupsCheckboxes[groupName])
        {
            var selectionMechanism = groupsCheckboxes[groupName][itemName];
            selectionMechanism.checked = false;
        }
    }
}

function viewPoint(point)
{
    scrollToTop();
    if(point == null)
    {
        //if point is null, then this function will jump to the current point
        currentPointNumber = match.calculateNumPoints()+1;
        updatePointNumber();
        unselectAll();

    }
    else
    {
        currentPointNumber = parseInt(point["_PointNumber"]);
        updatePointNumber();
        unselectAll();
        for(let group in point)
        {
            if(!group.startsWith("_"))
            {
                var itemsSelected = point[group];
                for(var i = 0; i < itemsSelected.length; i++)
                {
                    groupsCheckboxes[group][itemsSelected[i]].checked = true;
                }
            }
        }
    }

    

}
function loadAllPoints(points)
{
    var parent = document.getElementById("all-points");
    removeChildren(parent);
    for(var i = 0; i < points.length; i++)
    {
        let point = points[i];

        var pointDiv = document.createElement("div");
        pointDiv.className = "point-display";
        pointDiv.onclick = function(ev)
        {
            viewPoint(point);
        };

        var winnerSpan = document.createElement("span");
        winnerSpan.className = "point-winner-display";
        if(point["Point Won By"] && (point["Point Won By"].length==1))
        {
            var winner = point["Point Won By"][0];
            winnerSpan.appendChild(document.createTextNode(winner));
            if(winner == match.playersTeamName())
            {
                pointDiv.className += " point-won";
            }
            else if(winner == match.opponentsTeamName())
            {
                pointDiv.className += " point-lost";
            }
            else
                winnerSpan.appendChild(document.createTextNode("WINNER UNKNOWN"));
        }
        else
            winnerSpan.appendChild(document.createTextNode("WINNER UNKNOWN"));
        
        pointDiv.appendChild(winnerSpan);

        var serverSpan = document.createElement("span");
        serverSpan.className = "point-server-display";
        if(point["Server"] && point["Server"].length==1 && point["Server"][0].trim() != "")
        {
            serverSpan.appendChild(document.createTextNode("Server: " + point["Server"][0]));
        }
        else
        {
            serverSpan.appendChild(document.createTextNode("Server: Unknown"));
        }

        pointDiv.appendChild(serverSpan);

        parent.appendChild(pointDiv);


    }
}
function init()
{
    document.getElementsByTagName("h3").item(0).appendChild(document.createTextNode(match.getTitle()))
    

    currentPointNumber = match.calculateNumPoints()+1;
    
    


    new Group(groupsToDisplay, "Server", "Radio", match.players.concat(match.opponents));
    new Group(groupsToDisplay, "Side", "Radio", deuceAdArray);

    console.log(match.groups);


    for(let groupName in match.groups)
    {
        groupsToDisplay[groupName] = match.groups[groupName];
    }
    
    





    new Group(groupsToDisplay, "Point Won By", "Radio", [match.playersTeamName(), match.opponentsTeamName()]);

    displayGroups();
    refresh();







}

//currently in the middle of figuring out how to apply the statistics filters to the points list as well as statistics table


statisticsCheckboxes = {}
function initFilters()
{
    var checklist = document.getElementById("group-item-filters");
    removeChildren(checklist);
    for(let groupName in groupsToDisplay)
    {
        var group = groupsToDisplay[groupName];
        for(var j = 0; j < group.items.length; j++)
        {


            var item = group.items[j];

            var container = document.createElement("div");
            container.className = "col-sm-6 offset-sm-0 col-12 offset-0 col-lg-4 offset-lg-0";

            var label = document.createElement("label");
            
            
            let checkbox = document.createElement("input");
            checkbox.setAttribute("type","checkbox");
            checkbox.onclick = function(event) {console.log("clicked");loadFilters()};
            

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(groupName + ": " + item));

            container.appendChild(label);
            checklist.appendChild(container);

            statisticsCheckboxes[groupName + ":" + item] = checkbox;
        }

    }
    
}
function loadFilters()
{
    filters = [];//each element is "<groupName>:<itemName>" to filter by

    for(let groupNameColonItem in statisticsCheckboxes)
    {
        if(statisticsCheckboxes[groupNameColonItem].checked)
        {
            filters.push(groupNameColonItem);
        }
    }


    var points = [];
    for(var i = 1; i < match.calculateNumPoints()+1; i++)
    {
        var key = "match" + match.id + "point" + i;

        var point = localStorage.getItem(key);
        if(point == null) continue;

        point = stringToPoint(point);
        points.push(point);
    }
    allPoints = points;


    filteredPoints = [];
    for(var i = 0; i < points.length; i++)
    {
        var point = points[i];
        var included = true;

        for(var j = 0; j < filters.length; j++)
        {
            var split = filters[j].split(":");
            var groupName = split[0];
            var itemName = split[1];

            if(point[groupName] == null || point[groupName] == undefined || !point[groupName].includes(itemName))
            {
                included = false;
                break;
            }
        }
        if(included) 
        {
            filteredPoints.push(point);
        }
    }

    //fill the table with stats
    var totalNumPoints = points.length;
    doStatistics(filteredPoints, totalNumPoints, filters);


    // fill the points array
    loadAllPoints(filteredPoints);
}
function doStatistics(filteredPoints, totalNumPoints, filters)
{

    removeChildren(document.getElementById("filter-display"));
    if(filters.length > 0)
    {
        var filtersString = "For points that match criteria ";
        for(var i = 0; i < filters.length; i++)
        {
            filtersString += "\"" + filters[i].replace(":", " ") + "\","
        }
        if(filtersString.endsWith(",")) filtersString = filtersString.substring(0, filtersString.length-1);
        document.getElementById("filter-display").appendChild(document.createTextNode(filtersString));
    }
    else
        document.getElementById("filter-display").appendChild(document.createTextNode("For all points"));


    var wins = 0;

    for(var i = 0; i < filteredPoints.length; i++)
    {
        var point = filteredPoints[i];
        if(isPointWin(point))
        {
            wins ++;
        }
    }

    
    var winPercent = round2(wins/filteredPoints.length * 100);
    var occurrences = filteredPoints.length;
    var occurrencePercent = round2(occurrences/totalNumPoints * 100);


    var winsCell = document.getElementById("wins-cell");
    var occurrencesCell = document.getElementById("noc-cell");
    var winPercentCell = document.getElementById("win-rate-cell");
    var occurrencePercentCell = document.getElementById("po-cell");

    removeChildren(winsCell);
    removeChildren(occurrencesCell);
    removeChildren(winPercentCell);
    removeChildren(occurrencePercentCell);

    winsCell.appendChild(document.createTextNode(wins));
    winPercentCell.appendChild(document.createTextNode(winPercent+"%"));
    occurrencesCell.appendChild(document.createTextNode(occurrences));
    occurrencePercentCell.appendChild(document.createTextNode(occurrencePercent+"%"));
    
}
function isPointWin(point)
{
    if(point["Point Won By"])
    {
        if(point["Point Won By"].length == 1)
        {
            if(point["Point Won By"][0] == match.playersTeamName())
            {
                return true;
            }
        }
    }
    return false;
}
function displayGroups()
{
    for(let groupName in groupsToDisplay)
    {
        var group = groupsToDisplay[groupName];
        if(groupName != group.name) throw "groupName (the key) is " + groupName + " but the actual name is " + group.name ;
        groupsCheckboxes[group.name] = {};
        

        var dataEntrySection = document.getElementById("data-entry-section");
        
        var singleGroupDataEntry = document.createElement("div");
        singleGroupDataEntry.className = "single-group-data-entry";
        singleGroupDataEntry.className += " col-md-4 col-6";

        var singleGroupDataEntryTitle = document.createElement("div");
        singleGroupDataEntryTitle.className = "single-group-data-entry-title";
        singleGroupDataEntryTitle.appendChild(document.createTextNode(group.name));

        singleGroupDataEntry.appendChild(singleGroupDataEntryTitle)

        for(var j = 0; j < group.items.length; j++)
        {
            let selectionMechanism = document.createElement("input");
            if(group.selectionType == "radio")
                selectionMechanism.type = "radio";
            else if(group.selectionType == "checkbox")
                selectionMechanism.type = "checkbox";

            selectionMechanism.name = groupName;
            

            var displayGroupItem = document.createElement("label");
            displayGroupItem.className = "display-group-item";
            displayGroupItem.appendChild(selectionMechanism);
            displayGroupItem.appendChild(document.createTextNode(group.items[j]));
            

            



            
            singleGroupDataEntry.appendChild(displayGroupItem);
            singleGroupDataEntry.appendChild(document.createElement("br"));

            groupsCheckboxes[groupName][group.items[j]] = selectionMechanism;
        }

        singleGroupDataEntry.appendChild(document.createElement("br"));
        dataEntrySection.appendChild(singleGroupDataEntry);




    }
}
function submitPoint()
{
    var pointInfo = {};





    for(let groupName in groupsCheckboxes)
    {
        pointInfo[groupName] = [];
        for(let itemName in groupsCheckboxes[groupName])
        {
            
            if(groupsCheckboxes[groupName][itemName].checked)
            {

                pointInfo[groupName].push(itemName);
                groupsCheckboxes[groupName][itemName].checked = false;
            }
        }
    }

    if(pointInfo["Side"].includes(deuceAdArray[0]))
    {
        groupsCheckboxes["Side"][deuceAdArray[1]].checked = true;
    }
    else
    {
        groupsCheckboxes["Side"][deuceAdArray[0]].checked = true;
    }



    if(pointInfo["Server"].length == 1)
    {
        groupsCheckboxes["Server"][pointInfo["Server"][0]].checked = true;
    }




    //console.log(pointInfo);

    pointInfo["_PointNumber"] = currentPointNumber;

    savePoint(pointInfo, match.id);
    currentPointNumber ++;
    refresh();
    pointAddConfirmation();
    
}
function pointAddConfirmation()
{
    var confirmation = document.getElementById("point-add-confirmation");
    confirmation.style.display = "flex";

    var opacity = 1;
    document.getElementById("point-add-confirmation").style.opacity = opacity;
    setTimeout(pointAddConfirmationStep, 2500, opacity);
}
function pointAddConfirmationStep(opacity)
{
    document.getElementById("point-add-confirmation").style.opacity = opacity;
    if(opacity > 0)
        setTimeout(pointAddConfirmationStep, .1, opacity - .01);
    
}


function exportMatch()
{
    var matchObj = JSON.parse(JSON.stringify(match));
    matchObj["points"] = allPoints;

    console.log(matchObj)

    //based on https://www.youtube.com/watch?v=io2blfAlO6E
    const data = JSON.stringify(matchObj, null, 2);
    const blob = new Blob([data], {type: "application/json"});
    const href = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"),
    {
        href, style:"display:none",
        download: match.getTitle()+".json"
    });
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(href);
    a.remove();
}

init()