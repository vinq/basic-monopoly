Random = {};

Random.getRandomQ = function(){
	return Math.random();
}

Random.getRandomBool = function(){
	return Math.random() > 0.5;
}

Random.getRandomArbitrary = function(min, max) {
	var x = Math.ceil(Math.random() * (max - min) + min);
	
	if (max == x) {
		x--;
	}
	return x;
}

Random.rollDices = function() {
	return Random.getRandomArbitrary(1, 12);
}

Random.getRandomName = function(numberOfChars){
	var numberOfChars = numberOfChars ?? 4;
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    var result = "";

    for ( var i = 0; i < numberOfChars; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
   	return result;
}

Random.getRandomArrayValue = function(array){
	var choose = [];

   	for (var key in array) {
    	choose.push(key);
	}

	var arrayLength = choose.length;	
	return array[choose[Math.floor(Math.random() * arrayLength)]];
}

Random.getRandomCost = function(options = {}){
	var price = Random.getRandomArbitrary(0, (options.field.power / options.field.loyalty) * 100);
	var status = Random.getRandomArbitrary(0, (options.field.loyalty / options.field.power) * 100);

	return {
		price: price,
		status: status
	};
}



Logger = {};

Logger.log = function(layer, vars){
	console.log("=======" + layer + "=======");
	console.log(vars);
	console.log("===========================");
}
