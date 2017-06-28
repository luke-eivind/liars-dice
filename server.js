//Server Setup
var express = require('express');
var socket = require('socket.io');
var app = express();
var server = app.listen(3000); //3000 is the port
var globalName = '';
var players = [];

app.use(express.static('public'));

console.log('server is running');

var io = socket(server);
io.sockets.on('connection', newConnection);

function newConnection(socket) {
	console.log('new connection',socket.id);

	socket.on('newPlayer', newName);
	socket.on('readyUp', allReady);

	function newName(data){
		players.push(new player(data,socket.id));
	}

	function allReady(data){
		globalName = data;
		var person = players.find(findPerson);
		person.ready = true;
		console.log('checking');
		if(checkAllReady(players)){
			io.sockets.emit('starting',players.length);
			var g = new game(players.length);
			startGame(g);				//should we make startgame a method of game?

		}
	}
}

function findPerson(person){
	return person.name === globalName;
}



//Game Code

class player{
	constructor(name, id){
		this.name = name;
		this.ready = false;
		this.numDice = 5;
		this.currentRoll = [];
		this.currentBid = [];
		this.sockID = id;
	}
    rollDice(){
    	var roll = []
    	for(var i = 0; i<this.numDice; i++){
    		roll.push(Math.floor((Math.random()*6)+1))
    	}
    	this.currentRoll = roll;
    	io.sockets.connected[this.sockID].emit('roll', roll);
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

function checkAllReady(p){
	check = true;
	p.forEach(function(person){
		if(person.ready == false)
			check = false;		
	});
	return check;
}

function startGame(g){
	g.rollDice();
	/*
	while(!g.isGameOver()){
		g.rollDice();
	}
	*/
}




