var game = new Phaser.Game(1200, 600, Phaser.AUTO, 'gameZone', { preload: preload, create: create, update: update });

function preload() {
	game.load.spritesheet('basicButton', './flixel-button.png', 80, 20);
	game.load.spritesheet('upgradeSprites', './UpgradeSprites.png', 74, 73);
	game.load.image('upgradeHeader', './UpgradeHeader.png');
}

var countText; 
var perSecondText;
var buildingButtonX = 950;
var buildingButtonY = 40;
var buttonSeparationY = 55  //Pixels between building buttons
var cursorButton; var cursorButtonText;
var farmButton; var farmButtonText;
var savedText; var saveGameButton; var saveButtonText;
var deleteSaveButton; var deleteButtonText;
var upgradeBanner;
function create() {
	game.stage.backgroundColor = 0x8d8dad;
	//Souls count in the center.
	countText = game.add.text(550, 300, 'Souls: 0', { fontSize: '48px', fill: '#004444', align: "center"});
	perSecondText = game.add.text(550, 350, 'Per Second: 0.5', { fontSize: '16px', fill: '#eeeeee', align: "center" });
	//version tracking number (for less obvious changes)
	var versionNumber = game.add.text(32, 32, 'Version ALPHA 0.094', { align: 'left'});
	savedText = game.add.text(32, 64, '', { align: 'left'});
	upgradeBanner = game.add.sprite(50, 100, 'upgradeHeader');
	
	
	//Building buttons and corresponding text. 
	
	//Laborers (AKA Cursors before clicking was abolished)
	cursorButton = game.add.button(buildingButtonX, buildingButtonY, 'basicButton', buyCursor, this, 0, 1, 2);
	cursorButton.scale.setTo(2.5, 2.5);
	//Font styling for all building buttons.
	var style = { font: "12px Arial", fill: "#004444", wordWrap: true, wordWrapWidth: cursorButton.width, align: "center" };
	cursorButtonText = game.add.text(0, 0, "Laborers      1" + "Cost: 10", style);
	cursorButtonText.x = Math.floor(cursorButton.x + 12);
    	cursorButtonText.y = Math.floor(cursorButton.y + 16);
    	//Farms
	farmButton = game.add.button(buildingButtonX, cursorButton.y + buttonSeparationY, 'basicButton', buyFarm, this, 0, 1, 2);
	farmButton.scale.setTo(2.5, 2.5);
	farmButtonText = game.add.text(0, 0, "Farms      0" + "Cost: 50", style);
	farmButtonText.x = Math.floor(farmButton.x + 12);
    	farmButtonText.y = Math.floor(farmButton.y + 16);
    	//Towns
	townButton = game.add.button(buildingButtonX, farmButton.y + buttonSeparationY, 'basicButton', buyTown, this, 0, 1, 2);
	townButton.scale.setTo(2.5, 2.5);
	townButtonText = game.add.text(0, 0, "Towns      0" + "Cost: 250", style);
	townButtonText.x = Math.floor(townButton.x + 12);
    	townButtonText.y = Math.floor(townButton.y + 16);


	//Save Game button.
	saveGameButton = game.add.button(25, 550, 'basicButton', saveGame, this, 0, 1, 2);
	saveGameButton.scale.setTo(1.5, 1.5);
	saveButtonText = game.add.text(0, 0, "Save Game", style);
	saveButtonText.x = Math.floor(saveGameButton.x + 20);
    	saveButtonText.y = Math.floor(saveGameButton.y + 11);
    	//Delete Save button.
	deleteSaveButton = game.add.button(155, 550, 'basicButton', deleteSave, this, 0, 1, 2);
	deleteSaveButton.scale.setTo(1.5, 1.5);
	deleteButtonText = game.add.text(0, 0, "DELETE SAVE", style);
	deleteButtonText.x = Math.floor(deleteSaveButton.x + 20);
    	deleteButtonText.y = Math.floor(deleteSaveButton.y + 11);
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
//Spell info - needs saved
var currentMana = 0; var totalMana = 100;
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
	if (autoSave % 10 == 0) savedText.text = ''; // Clear every other second.
	if (autoSave % 5 == 0 ) resetUpgrades();     // Once per second
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
var townUpgrade10Bought = false;

var upgradeArray = [];  // An array of upgrade objects
//One upgrade: 
/*
	spriteIndex: Index for upgrade spritesheet
	func:        Function to perform when image is clicked
	sprite:      Sprite object to display
*/
function resetUpgrades(){
//Destroy the previous array if it has anything in it.
	var index;
	for (index = upgradeArray.length - 1; index >= 0; index--){
		upgradeArray[index].sprite.destroy();  //Remove the sprite
		upgradeArray.pop(); // And trash the rest.
	}
//Rebuild the array of upgrade sprites
	if (cursorsBought >= 10 && !cursorUpgrade10Bought) { // 10 cursors, production x2, cost 50
		upgradeArray.push({spriteIndex: 0, func: cursorUpgrade10, sprite: 0});
	//	upgradeText += "<br><button onclick='cursorUpgrade10(50)'>Bronze Cursors - 50</button>";
        //	upgradeText += 'Increase Cursor output by 100%';
	}
	if (farms >= 10 && !farmUpgrade10Bought) { // 10 farms, production x2, cost 250
	upgradeArray.push({spriteIndex: 1, func: farmUpgrade10, sprite: 0});
	//	upgradeText += "<br><button onclick='farmUpgrade10(250)'>Bronze Tractors - 250</button>";
        //	upgradeText += 'Increase Farm output by 100%';
	}
	// 10 towns, production x2, cost 1500
	if (towns >= 10 && !townUpgrade10Bought) upgradeArray.push({spriteIndex: 2, func: townUpgrade10, sprite: 0});
//Display on screen
	upgradeArray.forEach(displayUpgrade);
	
}
//This is called for each item in the upgrade array.  Use the info passed to add a sprite to the game world.
var upgradeX = 40; var upgradeY = 150;  //Starter values
var upgradeSpacingX = 75; var upgradeSpacingY = 75;
var upgradeMaxX = 340; var upgradeMaxY = 450
function displayUpgrade(item){
	if (upgradeY <= upgradeMaxY){  //Stop printing if we run out of space.  TODO: improve?
		item.sprite = game.add.sprite(upgradeX, upgradeY, 'upgradeSprites', item.spriteIndex);
		item.sprite.inputEnabled = true;
		item.sprite.input.useHandCursor = true;
        	item.sprite.events.onInputDown.add(item.func, this);
        	upgradeX += upgradeSpacingX;
        	if (upgradeX > upgradeMaxX) {  //Start a new row
        		upgradeX = 40;
        		upgradeY += upgradeSpacingY;
		}
	}   
}

//Upgrade functions go here.
function cursorUpgrade10(){
	if (soulsCount >= 50){
		soulsCount -= 50;    //Pay the cost...
		cursorMulti *= 2; //Increase the multiplier...
		cursorUpgrade10Bought = true; //Disable the button.
		purchasedUpgrades++; //And increment the upgrade counter.
		resetUpgrades();
	}
}
function farmUpgrade10(){
	if (soulsCount >= 250){
		soulsCount -= 250;    //Pay the cost...
		farmMulti *= 2; //Increase the multiplier...
		farmUpgrade10Bought = true; //Disable the button.
		purchasedUpgrades++; //And increment the upgrade counter.
		resetUpgrades();
	}
}
function townUpgrade10(){
	if (soulsCount >= 1500){
		soulsCount -= 1500;    //Pay the cost...
		townMulti *= 2; //Increase the multiplier...
		townUpgrade10Bought = true; //Disable the button.
		purchasedUpgrades++; //And increment the upgrade counter.
		resetUpgrades();
	}
}
//Spell functions: TODO


// Save and load functions.
function saveGame(){
	var save = {
		soulsCount: soulsCount,
		cursorsBought: cursorsBought,
		cursorMulti: cursorMulti,
		farms: farms,
		farmMulti: farmMulti,
		towns: towns,
		townMulti: townMulti,
		allMulti: allMulti,
		currentMana: currentMana,
		totalMana: totalMana,
		purchasedUpgrades: purchasedUpgrades,
		cursorUpgrade10Bought: cursorUpgrade10Bought,
		farmUpgrade10Bought: farmUpgrade10Bought,
		townUpgrade10Bought: townUpgrade10Bought
	}
	var success = true;
	try{
		localStorage.setItem("save",JSON.stringify(save));
	}
	catch (e){
		success = false;
		console.log ("game save error!");
		console.log(e);
		savedText.text = 'SaveGame Error!';
	}
	if (success == true){
		savedText.text = 'Game Saved!';
		console.log("game saved");
	}
}
function loadGame(){
	var savegame = JSON.parse(localStorage.getItem("save"));
	if (savegame != null){
		// Currency total.
		if (typeof savegame.soulsCount !== "undefined") soulsCount = savegame.soulsCount;
		// Building totals and current multipliers
		if (typeof savegame.cursorsBought !== "undefined") cursorsBought = savegame.cursorsBought;
		if (typeof savegame.cursorMulti !== "undefined") cursorMulti = savegame.cursorMulti;
		if (typeof savegame.farms !== "undefined") farms = savegame.farms;
		if (typeof savegame.farmMulti !== "undefined") farmMulti = savegame.farmMulti;
		if (typeof savegame.towns !== "undefined") towns = savegame.towns;
		if (typeof savegame.townMulti !== "undefined") townMulti = savegame.townMulti;	
		if (typeof savegame.allMulti !== "undefined") allMulti = savegame.allMulti;
		//Spell info
		if (typeof savegame.currentMana !== "undefined") currentMana = savegame.currentMana;
		if (typeof savegame.totalMana !== "undefined") totalMana = savegame.totalMana;
		// Upgrade status
		if (typeof savegame.purchasedUpgrades !== "undefined") purchasedUpgrades = savegame.purchasedUpgrades;
		if (typeof savegame.cursorUpgrade10Bought !== "undefined") cursorUpgrade10Bought = savegame.cursorUpgrade10Bought;
		if (typeof savegame.farmUpgrade10Bought !== "undefined") farmUpgrade10Bought = savegame.farmUpgrade10Bought;
		if (typeof savegame.townUpgrade10Bought !== "undefined") townUpgrade10Bought = savegame.townUpgrade10Bought;
		console.log("game loaded!");
		resetButtons();
		 
	}
}
function deleteSave(){
	localStorage.removeItem("save");
	soulsCount = 0;
	cursorsBought = 1;
	farms = 0;
	towns = 0;
	cursorMulti = 1;
	farmMulti = 1;
	townMulti = 1;
	allMulti = 1;
	currentMana = 0;
	totalMana = 100;
	resetButtons();
}
