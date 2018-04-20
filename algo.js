const fs = require('fs');
var config = require('./../config');
const binance = require('node-binance-api');
var change = require('percent-change');
var CronJob = require('cron').CronJob;
var mysql = require('mysql');
var getPrices = require('./scan.js');

//DB connection//
var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "tradebot"
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
//DB connection


//Globals//
var btc = [];
var tickers = getSymbols();
var prices = [];
var boughtIn = false;
var soldOut = false;
var stream = [];
var timer = 0;
var test = "charts/";

var percent = 1.02;
var stoploss = 0.9800;
var amount = 1;

//Globals//

//
//
////
//
//

function priceLoop(){
    console.log(timer);
 
    console.log('fetching Latest Price Data!')
    tickers.forEach(function(pair){
    	
      fs.readFile(test + pair+'.json','UTF8', function (err, data) {
      	//console.log(pair);
      	ticks = getData(JSON.parse(data));
      	var time = Object.keys(ticks[5]);
        var current = ticks[5][time];
        var tick5Key = Object.keys(ticks[4]);
        var tick5 = ticks[4][tick5Key];
        var tick4Key = Object.keys(ticks[3]);
        var tick4 = ticks[3][tick4Key];
        var tick3Key = Object.keys(ticks[2]);
        var tick3 = ticks[2][tick3Key];
        var tick2Key = Object.keys(ticks[1]);
        var tick2 = ticks[1][tick2Key];
        var tick1Key = Object.keys(ticks[0]);
        var tick1 = ticks[0][tick1Key]; 

        priceData = getPrices.formatPriceData(pair, tick5, tick4, tick3, tick2, tick1, current, time);
        prices.push(priceData);
      });
  }); scan()
}; priceLoop();

function scan(){
  console.log('Scanning!');
      var algoResults = getPrices.algo(prices);
      setTimeout(function(){
        
        if(algoResults){
          if(algoResults[2] == true){
        buyIn(algoResults[0], algoResults[1], algoResults[3]);
          }else{
            console.log('not buying, F');
            var temp = timer + 60000;
            timer = temp;
            priceLoop();
          };
      }else{
        console.log(algoResults);
        console.log("not loaded yet, soz");
        setTimeout(scan, 5000);
      };
      }, 10000);
      
};


//Buy in function
function buyIn(symbol, current, time) {
  var highest = current;
  console.log('bought ' + symbol + " at: " + current + " time: " + time);
  //var time = current.time;
  var st = time;
  var timeOut = st + 300000;
  console.log(amount);

  	for(key in btc){
  		var btcTime = Object.keys(btc[key]);
  		
  		if(btcTime >= time){
  			con.query('INSERT INTO algo_test (type, pair, pair_price, btc_price, amount) VALUES (?,?,?,?,?)',['buy',symbol, current, btc[key][btcTime].close, amount]);
  			break;
  		}
  		
  	};

  var streamClose;
    fs.readFile(test+symbol+'.json','UTF8', function (err, data) {
    	var ticks = [];
    	var data1 = JSON.parse(data)
    	for(key in data1){
    		if(data1[key] >= time){
    			ticks.push(data1[key]);
    			//console.log(data1[key]);
    		}
    	};

    	for(key in ticks){
    		var timeNow = Object.keys(ticks[key]);
    		//console.log(current);
    		var Open = ticks[key][timeNow].open;
    		var close = ticks[key][timeNow].close;
    		var high = ticks[key][timeNow].high;
    		var low = ticks[key][timeNow].low;
    		//console.log(ticks[key]);
	        //var timeUntilTimeout = timeOut - timeNow;
	        
	        switch(true){
	          case timeNow >= timeOut :
	          	timer = timeNow;
	            console.log('timed out!');
	            sellOut(symbol, close, current);
	            soldOut = true;
	          return;


	          case high>highest :
	            highest = high;
	            var percentChange = change(current, close, true);
	            //console.log("highest price is:"+highest+", Current Price is:"+close+", Percent change: "+percentChange);
	          break;

	          case close / highest <= stoploss && soldOut == false :
	          	timer = timeNow;
	            sellOut(symbol, close, current);
	            soldOut = true;
	          return;

	          case close / current <= 0.9800 && soldOut == false :
	          	timer = timeNow;
	            sellOut(symbol, close, current);
	            soldOut = true;
	          return;

	          
	          default :
	            var percentChange = change(current, close, true);
	            //console.log(percentChange);
	          break;
        	};
        };
      });
};
//buyIn



//sell the current bought in pair//
function sellOut(symbol, close, bought){
  percentChange = change(bought, close, true);
  	for(key in btc){
  		var btcTime = Object.keys(btc[key]);
  		//console.log(btc);
  		temp = amount;
  		amount = close / bought * temp;

  		if(btcTime >= timer){
  			console.log("amount: " + amount + " temp: " + temp);
  			con.query('INSERT INTO algo_test (type, pair, pair_price, btc_price,profit, amount) VALUES (?,?,?,?,?,?)',['sell',symbol, close, btc[key][btcTime].close, percentChange, amount]);
  			break;
  		}
  		
  	};
  

  if(close / bought >= 1){
    console.log('word up yo! You made ' +percentChange+' profit!');
  }else{
    console.log('F, you lost '+percentChange);
  };
  boughtIn = false;
  for(key in prices){
    delete prices[key];
  };
  priceLoop();
return;
  
};

//sell out//

function getData(data){
    for(i=0, i2=0, ticks=[]; i<data.length; i++){
    	key = Object.keys(data[i]);
    	//console.log(key);
    	//console.log(data[i][key].final)
    	if(key >= timer){
			if(data[i][key].final == true ){
			    i2++;
			    
			    ticks.push(data[i]);
			      	if(i2 == 6){
			      		//console.log(ticks);
			      		return ticks;
			      	};
			};
		};
	};
};

function getSymbols(){
	tickers = [];
	var files = fs.readdirSync('charts');

	files.forEach(function(file){
		if(file.search('BTCUSDT')== -1){
			//console.log(file);
			temp = file.slice(0, -5);
			tickers.push(temp);
		};
	});
	fs.readFile('charts/BTCUSDT.json','UTF8', function (err, data) {
		temp = JSON.parse(data);
		for(key in temp){
			time = Object.keys(temp[key]);
			if(temp[key][time].final == true){
				btc.push(temp[key]);
			};
		}; //console.log(btc);
	});
	return tickers;
};

//console.log(files);