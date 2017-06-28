var me = -1;

window.onload = function(){
	var socket;
	socket = io.connect('http://localhost:3000');	
}



class player{
	constructor(name){
		this.name = name;
		this.ready = false;
		this.numDice = 5;
		this.currentRoll = [];
		this.currentBid = [];
	}
    rollDice(){
    	var roll = []
    	for(var i = 0; i<this.numDice; i++){
    		roll.push(Math.floor((Math.random()*6)+1))
    	}
    	this.currentRoll = roll;
    }
    makeBid(prevQuantity=0, prevValue=0){
    	console.log(prevQuantity, prevValue);
    	var quantity = window.prompt("Enter a quantity or call bullshit");
    	if(quantity == 'call')
    		return ['call'];
    	var value = window.prompt("Enter a value");
    	return [quantity,value];

    }
}

class game{
	constructor(numPlayers){
		this.numPlayers = numPlayers;
		this.numDice = numPlayers * 5;
		this.gameOver = false;
		this.call = false;
	}

	rollDice(){
		players.forEach(function(p){
			p.rollDice();
		});
	}
	isGameOver(){
		return this.gameOver ? true : false;
	}
	startBetting(){
		var self = this;
		var prevValue = 0;
		var prevQuantity = 0;
		while(!this.call){
			players.forEach(function(p){
				if(!self.call){
					var bid = p.makeBid();
					if(bid[0] == 'call')
						self.call = true;
				}
			});
		}
	}
}

function bettingHelper(){
	players.forEach(function(p){
		if(!g.call){
			var bid = p.makeBid();
			if(bid[0] == 'call')
				g.call = true;
		}
	});
}



var player1 = new player('logan');
var player2 = new player('luke');
var players = [player1, player2];
var g = new game(players.length);
g.rollDice();
console.log(player1.currentRoll);
console.log(player2.currentRoll);
//g.startBetting();



function newPlayer(){
	x = document.getElementById('name').value;
	if(x == '')
		alert('input a name');
	else{
		me = new player(x)
	}
}

function readyUp(){
	if(me == -1)
		alert('Pick a name first');
	else{
		me.ready = true;
		players.push(me);
		players.forEach(function(p))
	}
}




/*
players.forEach(function(player){
	player.rollDice();
})
*/