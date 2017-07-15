var me = -1;
var socket;
var currBid;
var diceCount = 0;


var dicePictures = {
	1: 'dice-pics/onedie.png',
	2: 'dice-pics/twodie.png',
	3: 'dice-pics/threedie.png',
	4: 'dice-pics/fourdie.png',
	5: 'dice-pics/fivedie.png',
	6: 'dice-pics/sixdie.png',
}



window.onload = function(){
	socket = io.connect('http://localhost:3000');
	socket.on('starting',function(data){
		diceCount = 5;
		console.log('now starting with ' + data + ' players');
		document.getElementById("numDice").innerHTML = 'YOU HAVE 5 DICE';
		document.getElementById("namePrompt").style.visibility = "hidden";

	});

	socket.on('roll', function(data){
		for(var i = 0; i<5; i++){
			document.getElementById('die'+(i+1).toString()).src = '';
		}
		var counter = 0;
		data.forEach(function(die){
			counter++;
			document.getElementById('die'+counter.toString()).src = dicePictures[die];
		})
		console.log(data);
	});	

	socket.on('promptFirstBid', promptFirstBid);
	socket.on('promptNextBid', promptNextBid);
	socket.on('loseTurn', loseTurn);
	socket.on('someoneLossed', someoneLossed);
	socket.on('gameOver', gameOver);

	document.getElementById("waiting").style.visibility = "visible";
	document.getElementById("bidPrompt").style.visibility = "hidden";
}

function startup(data){
	


}


function promptFirstBid(data){
	currBid = [0,0];
	document.getElementById("waiting").style.visibility = "hidden";
	document.getElementById("bidPrompt").style.visibility = "visible";
	
}

function promptNextBid(data){
	currBid = data;
	document.getElementById("waiting").style.visibility = "hidden";
	document.getElementById("currentBid").innerHTML = data[0] + '' + data[1] + ' \'s';
	document.getElementById("bidPrompt").style.visibility = "visible";
}

//todo: handle illegal bids and calling
function checkBid(){
	var quantity = document.getElementById("quantity").value;
	var die = document.getElementById("die").value;
	if(quantity == 'call'){
		sendBid(quantity, die);
	}
	else if(quantity>currBid[0]){
		sendBid(quantity, die);
	}
	else if(quantity == currBid[0] && die > currBid[1]){
		sendBid(quantity, die);
	}
	else
		alert('illegal bid');
}

function sendBid(quantity, die){
	socket.emit('returnBid', [quantity, die]);
	document.getElementById("bidPrompt").style.visibility = "hidden";
	document.getElementById("waiting").style.visibility = "visible";
}

function loseTurn(data){
	console.log('lose 1 die')
	diceCount--;
	document.getElementById("numDice").innerHTML = "YOU HAVE " + diceCount + " DICE";
}

function someoneLossed(data){
	console.log(data + ' lossed the round');
}

function gameOver(data){
	console.log(data + 'WON');
}


function newPlayer(){
	var x = document.getElementById('name').value;
	if(x == '')
		alert('input a name');
	else{
		socket.emit('newPlayer', x);
		me = x;
	}
}

function readyUp(){
	if(me == -1)
		alert('Pick a name first');
	else{
		socket.emit('readyUp', me);
	}
}
