var game = new Phaser.Game(1200, 600, Phaser.AUTO, 'gameZone', { preload: preload, create: create, update: update });

function preload() {
	game.load.spritesheet('basicButton', './flixel-button.png', 80, 20);
}

var countText; 
var perSecondText;
var buildingButtonX = 950;
var buildingButtonY = 40;
var buttonSeparationY = 60  //Pixels between building buttons
var cursorButton; var cursorButtonText;
var farmButton; var farmButtonText;
function create() {
	game.stage.backgroundColor = 0x8d8dad;
	//Souls count in the center.
	countText = game.add.text(550, 300, 'Souls: 0', { fontSize: '48px', fill: '#004444', align: "center"});
	perSecondText = game.add.text(550, 350, 'Per Second: 0.5', { fontSize: '16px', fill: '#eeeeee', align: "center" });
	//version tracking number (for less obvious changes)
	var versionNumber = game.add.text(32, 32, 'Version ALPHA 0.05', { align: 'left'});
	
	
	//Building buttons and corresponding text. 
	
	//Laborers (AKA Cursors before clicking was abolished)
	cursorButton = game.add.button(buildingButtonX, buildingButtonY, 'basicButton', buyCursor, this, 0, 1, 2);
	cursorButton.scale.setTo(2.5, 2.5);
	//Font styling for all building buttons.
	var style = { font: "16px Arial", fill: "#004444", wordWrap: true, wordWrapWidth: cursorButton.width, align: "center" };
	cursorButtonText = game.add.text(0, 0, "Laborers      1" + "Cost: 10", style);
	cursorButtonText.x = Math.floor(cursorButton.x + 22);
    	cursorButtonText.y = Math.floor(cursorButton.y + 12);
    	//Farms
	farmButton = game.add.button(buildingButtonX, cursorButton.y + buttonSeparationY, 'basicButton', buyFarm, this, 0, 1, 2);
	farmButton.scale.setTo(2.5, 2.5);
	farmButtonText = game.add.text(0, 0, "Farms      0" + "Cost: 50", style);
	farmButtonText.x = Math.floor(farmButton.x + 22);
    	farmButtonText.y = Math.floor(farmButton.y + 12);
    	//Towns
	townButton = game.add.button(buildingButtonX, cursorButton.y + buttonSeparationY, 'basicButton', buyTown, this, 0, 1, 2);
	townButton.scale.setTo(2.5, 2.5);
	townButtonText = game.add.text(0, 0, "Towns      0" + "Cost: 250", style);
	townButtonText.x = Math.floor(townButton.x + 22);
    	townButtonText.y = Math.floor(townButton.y + 12);

	//Reset all building button text to reflect loaded game.
	resetButtons();
	//The primary increment function.
	game.time.events.loop(200, incrementByProd, this);
}

//Building values that need saved: Count, base production, production multiplier.
var soulsCount = 0;
var cursorsBought = 1;
var cursorProd = 0.5;
var cursorMulti = 1;
var farms = 0;
var farmProd = 3;
var farmMulti = 1;
var towns = 0;
var townProd = 15;
var townMulti = 1;
var allMulti = 1;
// Building values that don't need saved: Base building cost, total production amount
var cursorBaseCost = 9;
var farmBaseCost = 50;
var townBaseCost = 250;
var totalProd = 0;
var tickInterval= 1000;     // Modifiable by upgrades.
var gameTick = 200;	    // The "master" game speed.
var autoSave = -1;

//Main game stuff.  Basic increment function, window update interval, number printing.
function update() {
    	
}


function incrementByProd(){ //Master game "tick" is 5 times per second.
	//cookieClick(cursors);	
	if (autoSave == -1) loadGame();
	autoSave++;
	if(autoSave >= 300) { //Every 60 seconds
		saveGame();
		autoSave = 0;
	}
	calcTotalProd();
	soulsCount = soulsCount + (totalProd * (gameTick / tickInterval)); //Increment total souls
	countText.text = 'Souls: ' + prettify(soulsCount);		   //Update running counter
	perSecondText.text = 'Per Second: ' + prettify(totalProd);
	//document.getElementById("cookies").innerHTML = prettify(cookies);
	//document.getElementById("cps").innerHTML = totalProd;

}

function calcTotalProd(){
	//Add up the individual buildings with their multipliers
	totalProd = (cursorProd * cursorMulti * cursorsBought) + (farmProd * farmMulti * farms) + (townProd * townMulti * towns);
	//Now include any global multipliers.
	totalProd = totalProd * allMulti;
}

function prettify(input){
    var output = Math.round(input * 1000000)/1000000;
	return output;
}

//Building button text and purchase functions.
function resetButtons(){
	// Update button text
	var nextCost = Math.floor(9 * Math.pow(1.15,cursorsBought));       //works out the cost of the next cursor
    	cursorButtonText.text = "Workers: " + cursorsBought + "  Cost: " + nextCost; //Display on button text
	nextCost = Math.floor(50 * Math.pow(1.15,farms));            //Same for farms...         
	farmButtonText.text = "Farms: " + farms + "  Cost: " + nextCost; 
	nextCost = Math.floor(250 * Math.pow(1.15,towns));            //Same for towns...         
	townButtonText.text = "Town Centers: " + towns + "  Cost: " + nextCost; 
}

function buyCursor(){
    var cursorCost = Math.floor(cursorBaseCost * Math.pow(1.15,cursorsBought));     //works out the cost of this cursor
    if(soulsCount >= cursorCost){                                   //checks that the player can afford the cursor
        cursorsBought++;                                               //increases number of cursors
    	soulsCount = soulsCount - cursorCost;                          //removes the cookies spent
	var nextCost = Math.floor(cursorBaseCost * Math.pow(1.15,cursorsBought)); //works out the cost of the next cursor
        cursorButtonText.text = "Laborers: " + cursorsBought + "  Cost: " + nextCost; 
	countText.text = 'Souls: ' + prettify(soulsCount);
    };
};

function buyFarm(){
    var farmCost = Math.floor (farmBaseCost * Math.pow(1.15,farms));      
    if(soulsCount >= farmCost){                                   
        farms++;                                     
    	soulsCount = soulsCount - farmCost;  
	var nextCost = Math.floor(farmBaseCost * Math.pow(1.15,farms));                       
	farmButtonText.text = "Farms: " + farms + "  Cost: " + nextCost; 
	countText.text = 'Souls: ' + prettify(soulsCount);
    };
};

function buyTown(){
    var townCost = Math.floor (townBaseCost * Math.pow(1.15,towns));      
    if(soulsCount >= townCost){                                   
        towns++;                                     
    	soulsCount = soulsCount - townCost;  
	var nextCost = Math.floor(townBaseCost * Math.pow(1.15,towns));                       
	townButtonText.text = "Towns: " + towns + "  Cost: " + nextCost; 
	countText.text = 'Souls: ' + prettify(soulsCount);
    };
};
//Upgrade functions: TODO
var purchasedUpgrades = 0;
var cursorUpgrade10Bought = false;
var farmUpgrade10Bought = false;
// Save and load functions
function saveGame(){
	var save = {
		cookies: cookies,
		cursorsBought: cursorsBought,
		cursorMulti: cursorMulti,
		farms: farms,
		farmMulti: farmMulti,
		towns: towns,
		townMulti: townMulti,
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
		if (typeof savegame.cursorsBought !== "undefined") cursorsBought = savegame.cursorsBought;
		if (typeof savegame.cursorMulti !== "undefined") cursorMulti = savegame.cursorMulti;
		if (typeof savegame.farms !== "undefined") farms = savegame.farms;
		if (typeof savegame.farmMulti !== "undefined") farmMulti = savegame.farmMulti;
		if (typeof savegame.towns !== "undefined") towns = savegame.towns;
		if (typeof savegame.townMulti !== "undefined") townMulti = savegame.townMulti;	
		// Upgrade status
		if (typeof savegame.purchasedUpgrades !== "undefined") purchasedUpgrades = savegame.purchasedUpgrades;
		if (typeof savegame.cursorUpgrade10Bought !== "undefined") cursorUpgrade10Bought = savegame.cursorUpgrade10Bought;
		if (typeof savegame.farmUpgrade10Bought !== "undefined") farmUpgrade10Bought = savegame.farmUpgrade10Bought;
		console.log("game loaded!");
		resetButtons();
		 
	}
}
