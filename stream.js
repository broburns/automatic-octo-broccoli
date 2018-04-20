var config = require('./../config');
const binance = require('node-binance-api');
//const stream = require('stream');
const fs = require('fs');
const update = require('json-update')


  //			//
 // get pairs  //
//			  //

var tickers = [];


function getPairs(){
  binance.prevDay(false, (error, prevDay) => {
    // console.log(prevDay); // view all data
    for ( let obj of prevDay ) {
      let symbol = obj.symbol;
      var volume = obj.lastPrice * obj.volume;
      if(symbol.search('BTC')!= -1 && symbol.search('BNB') == -1){
        tickers.push(symbol);
      };
      
    }; 
  }); //console.log(tickers);
}; getPairs();

  //			//
 // get pairs  //
//			  //

//console.log(tickers);
function streams(){
	console.log("pipe it up!")
	tickers.forEach(function(ticker){
		console.log('starting stream for:' + ticker);
		var candles = [];
		binance.websockets.candlesticks(ticker, "1m", (candlesticks) => {
		  let { e:eventType, E:eventTime, s:symbol, k:ticks } = candlesticks;
		  let { o:open, h:high, l:low, c:close, v:volume, i:interval, x:isFinal} = ticks;
		 
		  var update = {
		  	[eventTime] : 
			  	{
				  	open: open,
				  	close: close,
				  	high: high,
				  	low: low,
				  	volume: volume,
				  	final : isFinal
			  	}
			};
			candles.push(update);
		fs.writeFile("./charts5/"+symbol+".json", JSON.stringify(candles, null, 4), function(err){
			if(err){
				console.log(err)
			}
			
		});
		});
	});
};


/*
function streams(){
tickers.forEach(function(ticker){
	binance.candlesticks(ticker, "5m", (error, ticks, symbol) => {
	  let last_tick = ticks[ticks.length - 1];
	  //let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
	  var candles = [];
		  ticks.forEach(function(tick){
		  	var time = tick[0];
		  	var candle = {
		  		[time] : {
		  			open:tick[1],
		  			close:tick[4],
		  			high:tick[2],
		  			low:tick[3],
		  			volume:tick[5],
		  			isFinal:true
		  		}
		  	};
		  	candles.push(candle);
		  });
		 fs.writeFile("./charts6/"+symbol+".json", JSON.stringify(candles, null, 4), function(err){
			if(err){
				console.log(err)
			}; 
		});
	});
	
});
};
*/
setTimeout(streams, 5000);