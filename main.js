var cookies = 0;
//Building values that need saved: Count, base production, production multiplier.
var cursors = 1;
var cursorProd = 0.5;
var cursorMulti = 1;
var farms = 0;
var farmProd = 3;
var farmMulti = 1;
// Building values that don't need saved: Base building cost, total production amount
var cursorBaseCost = 9;
var farmBaseCost = 50;
var totalProd = 0;
var tickInterval=1000;  // Modifiable by upgrades.
var gameTick = 200;	    // The "master" game speed.
var autoSave = -1;
//Main game stuff.  Basic increment function, window update interval, number printing.
function cookieClick(number){
    cookies = cookies + number;
    document.getElementById("cookies").innerHTML = prettify(cookies);
};

function incrementByProd(){
	//cookieClick(cursors);	
	calcTotalProd();
	cookies = cookies + (totalProd * (gameTick / tickInterval));
	document.getElementById("cookies").innerHTML = prettify(cookies);
	document.getElementById("cps").innerHTML = totalProd;

}

function calcTotalProd(){
	totalProd = (cursorProd * cursorMulti * cursors) + (farmProd * farmMulti * farms);
}

function prettify(input){
    var output = Math.round(input * 1000000)/1000000;
	return output;
}

window.setInterval(function(){
	if (autoSave == -1) loadGame();
	//This is stupid.  But avoid resetting upgrades 5 times per second. Hopefully prevents lag or something.
	if (autoSave%5 == 1) resetUpgrades();
	//console.log(cookies);
	incrementByProd();
	autoSave = autoSave + 1;
	if(autoSave >= 300) {
		saveGame();
		autoSave = 0;
	}
	
}, gameTick);
//Saving and loading the game.
function saveGame(){
	var save = {
		cookies: cookies,
		cursors: cursors,
		cursorMulti: cursorMulti,
		farms: farms,
		farmMulti: farmMulti,
		purchasedUpgrades: purchasedUpgrades,
		cursorUpgrade10Bought: cursorUpgrade10Bought,
		farmUpgrade10Bought: farmUpgrade10Bought
	}
	
	localStorage.setItem("save",JSON.stringify(save));
	console.log("game autosaved");
}
function loadGame(){
	var savegame = JSON.parse(localStorage.getItem("save"));
	if (savegame != null){
		// Currency total.
		if (typeof savegame.cookies !== "undefined") cookies = savegame.cookies;
		// Building totals and current multipliers
		if (typeof savegame.cursors !== "undefined") cursors = savegame.cursors;
		if (typeof savegame.cursorMulti !== "undefined") cursorMulti = savegame.cursorMulti;
		if (typeof savegame.farms !== "undefined") farms = savegame.farms;
		if (typeof savegame.farmMulti !== "undefined") farmMulti = savegame.farmMulti;
		// Upgrade status
		if (typeof savegame.purchasedUpgrades !== "undefined") purchasedUpgrades = savegame.purchasedUpgrades;
		if (typeof savegame.cursorUpgrade10Bought !== "undefined") cursorUpgrade10Bought = savegame.cursorUpgrade10Bought;
		if (typeof savegame.farmUpgrade10Bought !== "undefined") farmUpgrade10Bought = savegame.farmUpgrade10Bought;
		console.log("game loaded!");
		resetButtons();
		 
	}
}
function deleteSave(){
	localStorage.removeItem("save");
	cookies = 0;
	cursors = 1;
	farms = 0;
	farmProd = 0;
	resetButtons();
}
//Building button text and purchase functions.
function resetButtons(){
	// Update button text
	var nextCost = Math.floor(9 * Math.pow(1.15,cursors));       //works out the cost of the next cursor
    document.getElementById('cursorButtonText').innerHTML = "Cursors: " + cursors + "  Cost: " + nextCost;
	nextCost = Math.floor(50 * Math.pow(1.15,farms));                       
    document.getElementById('farmButtonText').innerHTML = "Farms: " + farms + "  Cost: " + nextCost;
}

function buyCursor(){
    var cursorCost = Math.floor(cursorBaseCost * Math.pow(1.15,cursors));     //works out the cost of this cursor
    if(cookies >= cursorCost){                                   //checks that the player can afford the cursor
        cursors++;                                               //increases number of cursors
    	cookies = cookies - cursorCost;                          //removes the cookies spent
		var nextCost = Math.floor(cursorBaseCost * Math.pow(1.15,cursors));       //works out the cost of the next cursor
        document.getElementById('cursorButtonText').innerHTML = "Cursors: " + cursors + "  Cost: " + nextCost; 
		document.getElementById('cookies').innerHTML = prettify(cookies); 
    };
};

function buyFarm(){
    var farmCost = Math.floor (farmBaseCost * Math.pow(1.15,farms));      
    if(cookies >= farmCost){                                   
        farms++;                                     
    	cookies = cookies - farmCost;  
		var nextCost = Math.floor(farmBaseCost * Math.pow(1.15,farms));                       
        document.getElementById('farmButtonText').innerHTML = "Farms: " + farms + "  Cost: " + nextCost;  
        document.getElementById('cookies').innerHTML = prettify(cookies);  
    };
};
//Upgrade buttons and function. Buttons and text appended to area "upgradeZone" to become available.
var purchasedUpgrades = 0;
var cursorUpgrade10Bought = false;
var farmUpgrade10Bought = false;

function resetUpgrades(){
	document.getElementById('upgradeZone').innerHTML = "";
    var upgradeText = "";

    if (cursors >= 10 && !cursorUpgrade10Bought) { // 10 cursors, production x2, cost 50
		upgradeText += "<br><button onclick='cursorUpgrade10(50)'>Bronze Cursors - 50</button>";
        upgradeText += 'Increase Cursor output by 100%';
	}
	if (farms >= 10 && !farmUpgrade10Bought) { // 10 farms, production x2, cost 250
		upgradeText += "<br><button onclick='farmUpgrade10(250)'>Bronze Tractors - 250</button>";
        upgradeText += 'Increase Farm output by 100%';
	}
	upgradeText = upgradeText + "<br>Purchased upgrades: " + purchasedUpgrades;
	document.getElementById('upgradeZone').innerHTML = upgradeText;
}

function cursorUpgrade10(cost){
	if (cookies >= cost){
		cookies -= cost;    //Pay the cost...
		cursorMulti *= 2; //Increase the multiplier...
		cursorUpgrade10Bought = true; //Disable the button.
		purchasedUpgrades++; //And increment the upgrade counter.
		resetUpgrades();
	}
}
function farmUpgrade10(cost){
	if (cookies >= cost){
		cookies -= cost;    //Pay the cost...
		farmMulti *= 2; //Increase the multiplier...
		farmUpgrade10Bought = true; //Disable the button.
		purchasedUpgrades++; //And increment the upgrade counter.
		resetUpgrades();
	}
}
//More down here!