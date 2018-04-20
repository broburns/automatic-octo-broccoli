// scan.js
// ========
var config = require('./../config');
const binance = require('node-binance-api');
//config

module.exports.formatPriceData = function(pair, tick5, tick4, tick3, tick2, tick1, current, time){
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
			        	time : time
			        }
				} 
				
			};
//console.log(priceData[pair].current.time)
				return priceData;
};

module.exports.algo = function(prices){
	var weightedPairs = new Array;
    for(key in prices){
    	
	    var price = prices[key];
	    var pair = Object.keys(prices[key]);
	    console.log(price);
	    var conditions = formatTicks(pair, price);
	    indicator = conditions[0] + conditions[1] + conditions[2];
	    //console.log("pair: " + pair + ", strength level: " + indicator);
	    price[pair].weight = indicator;
	    weightedPairs.push({pair: pair, indicator : indicator, current : price[pair].current.close, time:price[pair].current.time});


	    
	    //order by highest indicator
    }; weightedPairs.sort(function(a, b){
    	return b.indicator - a.indicator;
    });
    	//returns to main//
    	var i=0;
    for(pair in weightedPairs){
    	i++;
		var symbol = weightedPairs[pair].pair;
		var time = weightedPairs[pair].time;
		//console.log(time);
    	console.log("pair: " + symbol + ", strength level: " + weightedPairs[pair].indicator);
		if(weightedPairs[pair].indicator >= 14){
			console.log("buy dis shit!" + symbol);
			var buy = true;
			var current = weightedPairs[pair].current
			 return [symbol, current, buy, time];
			    
		}else if(i == weightedPairs.length){
			return [null, null, false, time];
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
    		
    	
	}; //console.log(ticks);
		var cond1 = 0;
		var cond2 = 0;
		var cond3 = 0;
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

			return [cond1, cond2, cond3];
	};
 
function condition(ticks){
	var cond1 = 0;
	var cond2 = 0;
	var cond3 = 0;
	//console.log("This is from Condition: "+ticks);
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
		case ticks.current.volume / ticks.tick5.volume >=8 :
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

		return [cond1, cond2, cond3];
};



//storage//
//		//
/*
					tick5Open : tick5[1],
			        tick5Close : tick5[4],
			        tick5Volume : tick5[5],
			        tick4Open : tick4[1],
			        tick4Close : tick4[4],
			        tick4Volume : tick4[5],
			        tick3Open : tick3[1],
		          	tick3Close : tick3[4],
			        tick3Volume : tick3[5],
			        tick2Open : tick2[1],
			        tick2Close : tick2[4],
			        tick2Volume : tick2[5],
			        tick1Open : tick1[1],
			        tick1Close : tick1[4],
			        tick1Volume : tick1[5],
			        currentOpen : current[1],
			        currentClose : current[4],
			        currentVolume : current[5], */




			        /*
			        for(key in pairs){
    var pair = pairs[key];
    var previousClose = prices[key]['previousClose'];
    var currentClose = prices[key]['currentClose'];
    console.log("pair: "+pair+" ,previous: "+previousClose+" ,current: "+currentClose);

      if(currentClose / previousClose >= percent && boughtIn == false){
        boughtIn = true;
        buyIn(pair, previousClose, currentClose);
        priceLoop.stop();
        scan.stop();
      }; 
    };

    */
