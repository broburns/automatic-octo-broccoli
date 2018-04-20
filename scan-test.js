// scan.js
// ========
var config = require('./../config');
const binance = require('node-binance-api');
var loop = require('./algotest.js');
//config

module.exports.formatPriceData = function(pair, tick5, tick4, tick3, tick2, tick1, current, sma, vma){
			var priceData = {
				[pair]: {
			        tick5 : {
			        	open : tick5.open,
			        	close : tick5.close,
			        	volume : tick5.volume,
			        	high : tick5.high,
			        	low : tick5.low
			        },
			        tick4 : {
			        	open : tick4.open,
			        	close : tick4.close,
			        	volume : tick4.volume,
			        	high : tick4.high,
			        	low : tick4.low
			        },
			         tick3 : {
			        	open : tick3.open,
			        	close : tick3.close,
			        	volume : tick3.volume,
			        	high : tick3.high,
			        	low : tick3.low
			        },
			         tick2 : {
			        	open : tick2.open,
			        	close : tick2.close,
			        	volume : tick2.volume,
			        	high : tick2.high,
			        	low : tick2.low
			        },
			         tick1 : {
			        	open : tick1.open,
			        	close : tick1.close,
			        	volume : tick1.volume,
			        	high : tick1.high,
			        	low : tick1.low
			        },
			         current : {
			        	open : current.open,
			        	close : current.close,
			        	volume : current.volume,
			        	high : current.high,
			        	low : current.low,
			        	sma5 : sma.sma5,
			        	sma50 : sma.sma50,
			        	vma5 : vma.vma5,
			        	vma50 : vma.vma50
			        }
				} 
				
			};
				return priceData;
};

module.exports.algo = function(prices, buyIn){
	var weightedPairs = new Array;
    for(key in prices){
    	
	    var price = prices[key];
	    var pair = Object.keys(prices[key]);
	    //console.log(price);
	    var conditions = formatTicks(pair, price);
	    indicator = conditions[0] + conditions[1] + conditions[2] + conditions[3];
	    //console.log("pair: " + pair + ", strength level: " + indicator);
	    price[pair].weight = indicator;
	    weightedPairs.push({pair: pair, indicator : indicator, current : price[pair].current.close});


	    
	    //order by highest indicator
    }; weightedPairs.sort(function(a, b){
    	return b.indicator - a.indicator;
    });
    	//returns to main//
    	var i=0;
    	console.log("running!");
    for(pair in weightedPairs){
    	i++;
		var symbol = weightedPairs[pair].pair;
    	//console.log("pair: " + symbol + ", strength level: " + weightedPairs[pair].indicator);
		if(weightedPairs[pair].indicator >= 2){
			console.log("buy dis shit!" + symbol);
			var current = weightedPairs[pair].current
			buyIn(symbol, current);
			return
			    
		}else if(i == weightedPairs.length){
			console.log("not buying dat shit, F");
			return false;
		}; 
    };
};


function formatTicks(pair, prices){
	var ticks = [];
	var price = prices[pair];
	for(key in price){
		//console.log(price[key]);
    	range = price[key].close / price[key].open;
    	var positive;
    	if(range > 1){
    		positive = true;
    	}else{
    		positive = false;
    	};

    	ticks[key] = {
    			range : range,
    		volume : price[key].volume,
    		positive : positive
    		};
    		
    	
	}; 
		ticks['sma'] = {
			sma5 : price['current'].sma5,
			sma50 : price['current'].sma50
		}; 
		ticks['vma'] = {
			vma5 : price['current'].vma5,
			vma50 : price['current'].vma50
		};
	//console.log(ticks['vma']);
		var cond1 = 0;
		var cond2 = 0;
		var cond3 = 0;
		var cond4 = 0;
			if(ticks.tick5.positive == true){cond1++;};
			if(ticks.tick4.positive == true){cond1++;} ;
				
			if(ticks.tick3.positive == true){cond1++;}  ;
				
			if(ticks.tick2.positive == true){cond1++;}  ;
				
			if(ticks.tick1.positive == true){cond1++;} ;
				
			if(ticks.current.positive == true){cond1++;} ; 
				


		switch(true){
			case ticks.tick4.volume / ticks.tick5.volume >=2 :
				cond2++;
			case ticks.tick3.volume / ticks.tick4.volume >=2 :
				cond2++;
			case ticks.tick2.volume / ticks.tick3.volume >=2 :
				cond2++;
			case ticks.tick1.volume / ticks.tick2.volume >=2 :
				cond2++;
			case ticks.current.volume / ticks.tick5.volume >=4 :
				cond2++;
		break;
		};

		switch(true){
			case ticks.tick5.range >= 1.005 && ticks.tick5.positive == true :
				cond3++;
			case ticks.tick4.range >= 1.005 && ticks.tick4.positive == true :
				cond3++;
			case ticks.tick3.range >= 1.005 && ticks.tick3.positive == true :
				cond3++;
			case ticks.tick2.range >= 1.005 && ticks.tick2.positive == true :
				cond3++;
			case ticks.tick1.range >= 1.005 && ticks.tick1.positive == true :
				cond3++;
			case ticks.current.range >= 1.005 && ticks.current.positive == true :
				cond3++;

		break;
		};
			
		var smaAverage = ticks.sma.sma5 / ticks.sma.sma50;
		var vmaAverage = ticks.vma.vma5 / ticks.vma.vma50;

					//price moving averages
			if(smaAverage >= 1.01){
				cond4++;
			};
				
			if(smaAverage >= 1.03){
				cond4++;
			};
			if(smaAverage >= 1.05){
				cond4++
			};
			if(smaAverage >= 1.08){
				cond4++;
			};		 //end price moving averages
					//volume moving averages
			if(vmaAverage >= 1.05){
				cond4++
			};

			if(vmaAverage >= 1.10){
				cond4++
			};

			if(vmaAverage >= 1.20){
				cond4++
			};

			if(vmaAverage >= 1.50){
				cond4++
			};

					//end volume moving averages
		
		//console.log(vmaAverage);
		//console.log(cond4);
			
			return [cond1, cond2, cond3, cond4];
	};
 