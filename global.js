

groups = {};//represents a
customGroups = {};

function loadGroups()
{
    if(localStorage.getItem("customGroups") == null)
        localStorage.setItem("customGroups","");

    //load predefined groups
    new Group(groups, "Formation", "Radio", ["Standard", "Modified", "Aussie", "I-Formation", "Serve and Volley"]);
    new Group(groups, "Serve Pos", "Radio", ["1","2","3","4"]);
    new Group(groups, "Net Player Movement", "Radio", ["Dbl Left", "Left", "Right", "Dbl Right", "Alert"]);
    new Group(groups, "Exception", "Checkbox", ["Missed Ret", "Dbl Fault"]);
    
    

    //load custom groups
    var groupStrings = localStorage.getItem("customGroups").trim();
    if(groupStrings != "")
    {
        groupStrings = groupStrings.split(";")
        for(var i = 0; i < groupStrings.length; i++)
        {
            loadGroup(customGroups, groupStrings[i]);
        }
        
    }
}
function getAllCustomGroups()
{
    var groupStrings = localStorage.getItem("customGroups").trim();
    if(groupStrings == "") return [];
    
    groupStrings = groupStrings.split(";")
    var ret = [];
    for(var i = 0; i < groupStrings.length; i++)
    {
        ret.push(loadGroup(null, groupStrings[i]));
    }
    return ret;
    
}
function saveCustomGroupsArray(groupsToSave)
{
    var saveString = "";
    for(var i = 0; i < groupsToSave.length; i++)
    {
        if(i > 0) saveString += ";";
        saveString += groupsToSave[i].saveString();
    }
    localStorage.setItem("customGroups", saveString);
}

allowedCharsForInput = [
'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
'1','2','3','4','5','6','7','8','9','0',' ','\''


]
function validateInput(input)
{
    
    if(typeof input == typeof [])
    {
        for(var i = 0; i < input.length; i++)
        {
            validateInput(input[i]);
        }
    }
    else if(typeof input == typeof "")
    {
        for(var i = 0; i < input.length; i++)
        {
            if(!allowedCharsForInput.includes(input.charAt(i)))
            {
                var error = "You must input text with only uppercase or lowercase letters, numbers, spaces, or apostrophe and no other special characters";
                alert(error);
                throw error;
                
            }
        }
    }
}


function removeChildren(node)
{
    while(node.firstChild)
    {
        node.removeChild(node.lastChild);
    }
}



function newMatch(players, opponents, groups)
{
    if((typeof players) != typeof []) throw "Tried to create a new match, but players parameter \"" + players + "\" was not an array";
    if((typeof opponents) != typeof []) throw "Tried to create a new match, but opponents parameter \"" + opponents + "\" was not an array";
    if((typeof groups) != typeof []) throw "Tried to create a new match, but groups \"" + groups + "\" parameter was not an array";

    if(players.length != opponents.length)throw "Tried to create a new match, but number of players is NOT EQUAL to number of oppoents!";
    if(players.length != 2 && players.length != 1) throw "Tried to create a new match but the number of players on each team is " + players.length;



    return new Match(id=null, players=players, opponents=opponents, groupNames=groups);
}
function loadMatch(id)
{
    if(typeof id != typeof 1) throw "Tried to load match by id by id is not int. id is " + id
    return new Match(id=id)
}
function matchExists(id)
{
    return localStorage.getItem("match"+id) != null;
}



class Match
{
    

    date = null;
    players = [];
    opponents = [];
    groups = {};
    id = null;

    constructor(id=null, players=null, opponents=null, groupNames=null)
    {
        if(id === null)
        {
            //create a brand NEW match
            this.date = Date.now();
            
            this.id = parseInt(localStorage.getItem("maxMatchID"));
            localStorage.setItem("maxMatchID", parseInt(localStorage.getItem("maxMatchID")) + 1);


            if((typeof players) != typeof []) throw "Tried to create a new match, but players parameter was not an array";
            if((typeof opponents) != typeof []) throw "Tried to create a new match, but opponents parameter was not an array";
            if((typeof groups) != typeof []) throw "Tried to create a new match, but groups parameter was not an array";

            this.players = players;
            this.opponents = opponents;

            for(var i = 0; i < groupNames.length; i++)
            {
                var groupName = groupNames[i];
                if(groups[groupName] != undefined && groups[groupName] != null)
                {
                    this.groups[groupName] = groups[groupName];
                }
                else if(customGroups[groupName] != undefined && customGroups[groupName] != null)
                {
                    this.groups[groupName] = customGroups[groupName];
                }
                else
                {
                    throw "??? No group named " + groupName + " exists";
                }
                
            }


            
            this.save();



        }
        else
        {
            //LOAD the match with the corresponding id from the localstore into this new object

            var item = localStorage.getItem("match" + id);
            if(item == null) throw "match" + id + " does not exist";
            item = item.split(";");
            this.date = parseInt(item[0]);
            this.players = item[1].split(",");
            this.opponents = item[2].split(",");

            if(item[3].trim() == "")
                this.groups = {};
            else
            {
                var stringsForAllGroupsInThisMatch = item[3].split("~");
                for(var i = 0; i < stringsForAllGroupsInThisMatch.length; i++)
                {
                    loadGroup(this.groups, stringsForAllGroupsInThisMatch[i]);
                }
            }
                
            this.id = parseInt(item[4]);
            if(this.id != id) throw "????";
        }
    }
    stringRepresentation()
    {
        return this.date + ";" + 
        this.players.join(",") + ";" + 
        this.opponents.join(",") + ";" + 
        this.createGroupsStringRepresentation() + ";" + 
        this.id;
    }
    createGroupsStringRepresentation()
    {
        var ret = "";
        console.log("this.groups");
        console.log(this.groups);
        for(let groupName in this.groups)
        {
            var theGroup = this.groups[groupName];
            var groupString = theGroup.saveString();
            ret += groupString + "~";
        }

        if(ret.endsWith("~")) ret = ret.substring(0, ret.length-1);
        return ret;
    }
    save()
    {
        localStorage.setItem("match"+this.id, this.stringRepresentation());

    }
    getDateString()
    {
        var d = new Date(this.date);
        return d.toLocaleDateString();
    }
    getTitle()
    {
        return this.players.join("/") + " vs " + this.opponents.join("/");
    }

    calculateNumPoints()
    {
        var i = 1;
        while(true)
        {
            var key = "match" + this.id + "point" + i;
            if(localStorage.getItem(key) == null)
            {
                return i-1;
            }
            i += 1;
        }
    }
    playersTeamName()
    {
        /*
        if(this.players.length == 2)
        {
            return lastName(this.players[0]) + "/" + lastName(this.players[1]);
        }
        else if(this.players.length == 1)
        {
            return lastName(this.players[0]);
        }
        */
        if(this.players.length == 2)
        {
            return this.players[0] + "/" + this.players[1];
        }
        else if(this.players.length == 1)
        {
            return this.players[0];
        }
    }
    opponentsTeamName()
    {
        /*var ret = null;
        if(this.opponents.length == 2)
        {
            ret = lastName(this.opponents[0]) + "/" + lastName(this.opponents[1]);
        }
        else if(this.opponents.length == 1)
        {
            ret = lastName(this.opponents[0]);
        }
        if(ret == this.playersTeamName())
        {
            ret += "(opponent)"
        }
        return ret;
        */
        var ret = null;
        if(this.opponents.length == 2)
        {
            ret = this.opponents[0] + "/" + this.opponents[1];
        }
        else if(this.opponents.length == 1)
        {
            ret = this.opponents[0];
        }
        if(ret == this.playersTeamName())
        {
            ret += "(opponent)"
        }
        return ret;
    }
}
function lastName(fullName)
{
    if(fullName.trim() == "") return fullName;
    var names = fullName.split(" ");
    return names[names.length-1];
}



function loadGroup(container, groupString)
{
    var parts = groupString.split(":");
    if(parts.length < 2) throw "groupString must be a colon-separated list of values. The first two are the name and selectionType (Radio or Checkbox) and the rest are the list of choices for this group"
    var name = parts[0];
    var selectionType = parts[1].toLowerCase();
    var items = [];
    for(var i = 2; i < parts.length; i++)
    {
        items.push(parts[i]);
    }
    return new Group(container, name, selectionType, items);

    
}
class Group
{
    name = null;
    selectionType = null;
    items = [];
    constructor(container, name, selectionType, items)
    {
        this.name = name;
        this.selectionType = selectionType.toLowerCase();
        this.items = items;
        if(container != null)container[name] = this;
    }

    saveString()
    {
        var ret = this.name + ":" + this.selectionType;
        for(var i = 0; i < this.items.length; i++)
        {
            ret += ":" + this.items[i];
        }
        return ret;
    }
}




function pointToString(pointObject)
{
    var str = "";
    for(let key in pointObject)
    {
        if(key.startsWith("_"))
        {
            str += key + ":" + pointObject[key] + ";";
        }
        else
        {
            str += key + ":" + pointObject[key].join(",") + ";";
        }
        
    }

    if(str.endsWith(";"))
    {
        str = str.substring(0, str.length-1);
    }
    return str;
}
function stringToPoint(pointString)
{
    var ret = {};
    var parts = pointString.split(";");
    for(var i = 0; i < parts.length; i++)
    {
        var keyValue = parts[i].split(":");
        if(keyValue[1] == "")
        {
            ret[keyValue[0]] = []
        }
        else
        {
            ret[keyValue[0]] = keyValue[1].split(",");
        }
        
    }
    return ret;

}
function round2(f)
{
    return Math.round(f*100)/100.0;
}



function scrollToTop() //based on https://www.w3schools.com/howto/howto_js_scroll_to_top.asp
{
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    
}


function viewHome()
{
    location.href = "index.html";
}
function viewCreateMatch()
{
    location.href = "create-match.html";
}
function viewMatchDetails()
{
    location.href = "match-details.html";
}

function savePoint(pointInfo, matchID)
{
    var currentPointNumber = pointInfo["_PointNumber"];
    localStorage.setItem("match"+matchID+"point"+currentPointNumber, pointToString(pointInfo));
}

loadGroups();