//Server Setup
var express = require('express');
var socket = require('socket.io');
var app = express();
var server = app.listen(3000); //3000 is the port
var globalName;
var players = [];
var currentTurn = 0;
var lastPlayer;
var currentBid;
var g;

app.use(express.static('public'));

console.log('server is running');

var io = socket(server);
io.sockets.on('connection', newConnection);

function newConnection(socket) {
	console.log('new connection',socket.id);

	socket.on('newPlayer', newName);
	socket.on('readyUp', allReady);
	//socket.on('makeBid', makeBid)

	function newName(data){
		players.push(new player(data,socket.id,socket));
	}

	function allReady(data){
		globalName = data;
		var person = players.find(findPersonByName);
		person.ready = true;
		console.log('checking');
		if(checkAllReady(players)){
			io.sockets.emit('starting',players.length);
			g = new game(players.length);
			lastPlayer = players.length-1;
			startGame(g);				//should we make startgame a method of game?
		}
	}

	//function makeBid(data)
}

function findPersonByName(person){
	return person.name === globalName;
}


//Game Code

class player{
	constructor(name,id,socket){
		this.name = name;
		this.ready = false;
		this.numDice = 5;
		this.currentRoll = [];
		this.currentBid = [];
		this.sockID = id;
		this.socket = socket;
		socket.on('returnBid', this.readBid)
	}

    rollDice(){
    	var roll = []
    	for(var i = 0; i<this.numDice; i++){
    		var num = Math.floor((Math.random()*6)+1)
    		roll.push(num);
    		g.countDice(num);
    	}
    	this.currentRoll = roll;
    	io.sockets.connected[this.sockID].emit('roll', roll);
    }

    loseTurn(){
    	this.numDice--;
    }

    //REQUESTREQUESTREQUESTREQUESTREQUEST
    startBid(){
    	io.sockets.connected[this.sockID].emit('promptFirstBid',null);

    }

    //REQUESTREQUESTREQUESTREQUESTREQUEST
    nextBid(){
    	if(currentTurn == lastPlayer)
    		currentTurn = 0;
    	else
    		currentTurn++;
    	io.sockets.connected[players[currentTurn].sockID].emit('promptNextBid', currentBid);
    }

    //RESPONSERESPONSERESPONSERESPONSE
    readBid(data){
    	console.log(data[0], data[1]);
    	if(data[0] == 'call'){
    		g.call(currentBid);
    	}
    	else{
    		currentBid = data;
    		players[currentTurn].nextBid();
    	}
    }

}

class game{
	constructor(numPlayers){
		this.numPlayers = numPlayers;
		this.numDice = numPlayers * 5;
		this.gameOver = false;
		this.diceCounts;
	}

	rollDice(){
		this.diceCounts = [0,0,0,0,0];
		players.forEach(function(p){
			p.rollDice();
		});
		this.startBetting();
	}

	//probably remove this
	isGameOver(){
		return this.gameOver ? true : false;
	}
	
	startBetting(){
		players[currentTurn].startBid()
	}
	countDice(num){
		this.diceCounts[num-1]++;
	}
	call(){
		if(currentBid[0] <= this.diceCounts[currentBid[1]-1]){
			//player who called loses
			this.handleLoser(players[currentTurn], 1);
		}
		else{
			//player who was called loses
			this.handleLoser(players[prevTurn()], 0);
		}
	}

	//c indicates whether it was the caller or called who lost
	handleLoser(loser, c){
		io.sockets.connected[loser.sockID].emit('loseTurn', null);
		loser.loseTurn();
		io.sockets.emit('someoneLossed', loser.name);
		//todo: make sure play goes to the correct person after an elimination
		if(loser.numDice == 0){
			if(c == 1){
				players.splice(currentTurn,1);
			}
			else{
				players.splice(prevTurn(),1);
			}
			lastPlayer--;
			if(lastPlayer == 0){
				io.sockets.emit('gameOver', players[0]);
			}
			else{
				this.rollDice();
			}

		}
		else{

			currentTurn = nextTurn();
			this.rollDice();
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
//just call g.rollDice() directly?
function startGame(g){
	g.rollDice();
	//g.startBetting();
	/*
	while(!g.isGameOver()){
		g.rollDice();
	}
	*/
}

function prevTurn(){
	if(currentTurn == 0){
		return lastPlayer;
	}
	else{
		return currentTurn-1;
	}
}

function nextTurn(){
	if(currentTurn == lastPlayer){
		return 0;
	}
	else{
		return currentTurn+1;
	}
}




