var game = new Phaser.Game(1200, 600, Phaser.AUTO, 'gameZone', { preload: preload, create: create, update: update });

function preload() {
	game.load.spritesheet('basicButton', './flixel-button.png', 80, 20);
}

var countText; 
var perSecondText;
var buildingButtonX = 950;
var buildingButtonY = 40;
var buttonSeparationY = 70  //Pixels between building buttons
var cursorButton; var cursorButtonText;
var farmButton; var farmButtonText;
function create() {
	game.stage.backgroundColor = 0x8d8d8d;
	//Souls count in the center.
	countText = game.add.text(550, 300, 'Souls: 0', { fontSize: '48px', fill: '#000', align: "center"});
	perSecondText = game.add.text(550, 350, 'Per Second: 0.5', { fontSize: '16px', fill: '#000', align: "center" });
	//Building buttons and corresponding text. 
	
	//Cursors
	cursorButton = game.add.button(buildingButtonX, buildingButtonY, 'basicButton', buyCursor, this, 0, 1, 2);
	cursorButton.scale.setTo(2.5, 2.5);
	//Font styling for all building buttons.
	var style = { font: "16px Arial", fill: "#004444", wordWrap: true, wordWrapWidth: cursorButton.width, align: "center" };
	cursorButtonText = game.add.text(0, 0, "Cursors      1" + "Cost: 10", style);
	cursorButtonText.x = Math.floor(cursorButton.x + 22);
    	cursorButtonText.y = Math.floor(cursorButton.y + 12);
    	//Farms
	farmButton = game.add.button(buildingButtonX, cursorButton.y + buttonSeparationY, 'basicButton', buyFarm, this, 0, 1, 2);
	farmButton.scale.setTo(2.5, 2.5);
	farmButtonText = game.add.text(0, 0, "Farms      0" + "Cost: 50", style);
	farmButtonText.x = Math.floor(farmButton.x + 22);
    	farmButtonText.y = Math.floor(farmButton.y + 12);

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
// Building values that don't need saved: Base building cost, total production amount
var cursorBaseCost = 9;
var farmBaseCost = 50;
var totalProd = 0;
var tickInterval= 1000;     // Modifiable by upgrades.
var gameTick = 200;	    // The "master" game speed.
var autoSave = -1;

//Main game stuff.  Basic increment function, window update interval, number printing.
function update() {
    	
}


function incrementByProd(){
	//cookieClick(cursors);	
	calcTotalProd();
	soulsCount = soulsCount + (totalProd * (gameTick / tickInterval)); //Increment total souls
	countText.text = 'Souls: ' + prettify(soulsCount);		   //Update running counter
	perSecondText.text = 'Per Second: ' + prettify(totalProd);
	//document.getElementById("cookies").innerHTML = prettify(cookies);
	//document.getElementById("cps").innerHTML = totalProd;

}

function calcTotalProd(){
	totalProd = (cursorProd * cursorMulti * cursorsBought) + (farmProd * farmMulti * farms);
}

function prettify(input){
    var output = Math.round(input * 1000000)/1000000;
	return output;
}

//Building button text and purchase functions.
function resetButtons(){
	// Update button text
	var nextCost = Math.floor(9 * Math.pow(1.15,cursorsBought));       //works out the cost of the next cursor
    	cursorButtonText.text = "Cursors: " + cursorsBought + "  Cost: " + nextCost; //Display on button text
	nextCost = Math.floor(50 * Math.pow(1.15,farms));            //Same for farms          
	farmButtonText.text = "Farms: " + farms + "  Cost: " + nextCost; 
}

function buyCursor(){
    var cursorCost = Math.floor(cursorBaseCost * Math.pow(1.15,cursorsBought));     //works out the cost of this cursor
    if(soulsCount >= cursorCost){                                   //checks that the player can afford the cursor
        cursorsBought++;                                               //increases number of cursors
    	soulsCount = soulsCount - cursorCost;                          //removes the cookies spent
	var nextCost = Math.floor(cursorBaseCost * Math.pow(1.15,cursorsBought)); //works out the cost of the next cursor
        cursorButtonText.text = "Cursors: " + cursorsBought + "  Cost: " + nextCost; 
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
