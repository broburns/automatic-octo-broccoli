const fs = require('fs');
var config = require('./../config');
const binance = require('node-binance-api');
var change = require('percent-change');
var CronJob = require('cron').CronJob;
var mysql = require('mysql');
var getPrices = require('./scan-test.js');

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

//DB connection


//Globals//
var btc = [];
var timer;
var test = "charts5/";
var tickers = getSymbols();
var prices = prices();
var boughtIn = false;
var soldOut = false;
var stream = [];
smaInterval1 = 5;
smaInterval2 = 50;

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
    console.log('fetching Latest Price Data!')
    data = [];
    console.log(timer);
    tickers.forEach(function(pair){
        ticks = getData(pair);
      if(ticks.length == 50){
        sma = getSma(ticks);
        vma = getVma(ticks);
        //console.log(averages);
        var time = Object.keys(ticks[49]);
        var current = ticks[49][time];
        var tick5Key = Object.keys(ticks[48]);
        var tick5 = ticks[48][tick5Key];
        var tick4Key = Object.keys(ticks[47]);
        var tick4 = ticks[47][tick4Key];
        var tick3Key = Object.keys(ticks[46]);
        var tick3 = ticks[46][tick3Key];
        var tick2Key = Object.keys(ticks[45]);
        var tick2 = ticks[45][tick2Key];
        var tick1Key = Object.keys(ticks[44]);
        var tick1 = ticks[44][tick1Key]; 
        priceData = getPrices.formatPriceData(pair, tick5, tick4, tick3, tick2, tick1, current, sma, vma);
        if(pair == 'CDTBTC'){
          timer = time;
        };
        

        data.push(priceData);
      };
  }); if(getPrices.algo(data, buyIn) == false){
      temp = +timer+60000;
      timer = temp;
      console.log(amount);
      priceLoop()
      };
  return
}; priceLoop();


//Buy in function
function buyIn(symbol, current) {
  var highest = current;
  console.log('bought ' + symbol + " at: " + current + " time: " + timer);
  //var time = current.time;
  var st = +timer;
  var timeOut = st + 300000;
  //console.log(amount);

    for(key in btc){
      var btcTime = Object.keys(btc[key]);
      //console.log(btcTime);
      if(btcTime >= timer){
        //console.log(btcTime);
        //console.log(btc[key][btcTime]);
        con.query('INSERT INTO algo_test (type, pair, pair_price, btc_price, amount) VALUES (?,?,?,?,?)',['buy',symbol, current, btc[key][btcTime].close, amount]);
        break;
      }
      
    };


      var ticks = [];
      for(key in prices[symbol]){
        time = Object.keys(prices[symbol][key]);
        if(time >= timer){
          ticks.push(prices[symbol][key]);
          //console.log(data1[key]);
        }
      };

      for(key in ticks){
        var timeNow = Object.keys(ticks[key]);
        var Open = ticks[key][timeNow].open;
        var close = ticks[key][timeNow].close;
        var high = ticks[key][timeNow].high;
        var low = ticks[key][timeNow].low;
          
          switch(true){
            case timeNow >= timeOut :
              timer = timeNow;
              console.log(timeNow);
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
};
//buyIn



//sell the current bought in pair//
function sellOut(symbol, close, bought){
  percentChange = change(bought, close, true);
    for(key in btc){
      var btcTime = Object.keys(btc[key]);

      if(btcTime >= timer){
        temp = amount;
        amount = close / bought * temp;
        console.log(amount);
        con.query('INSERT INTO algo_test (type, pair, pair_price, btc_price,profit, amount) VALUES (?,?,?,?,?,?)',['sell',symbol, close, btc[key][btcTime].close, percentChange, amount]);
        break;
      }
      
    };
  

  if(close / bought >= 1){
    console.log('word up yo! You made ' +percentChange+' profit!');
  }else{
    console.log('F, you lost '+percentChange);
  };
  priceLoop();
return;
  
};

//sell out//

function getData(pair){
  for(i=0, i2=0,currentTicks=[], prevTicks=[]; i<prices[pair].length; i++){
      key = Object.keys(prices[pair][i]);

      //console.log("i: " + i + " length: " + prices[pair].length);
      if(key < timer){
        //console.log(pair+ ' time: ' + key + "timer: " + timer);
        if(prices[pair][i][key].final == true){
          prevTicks.push(prices[pair][i]);
          //console.log(prevTicks);
        }
      }
      else if(key >= timer){
        if(prices[pair][i][key].final == true ){
            i2++;
            currentTicks.push(prices[pair][i]);
                if(i2 == 1){
                  break;
                };
        }else if(prices[pair].length - i <= 1) {
                return false
              };
      };
  };
  temp = []
  prevTicks.reverse();
  for(i=0; i<49; i++){
    temp.push(prevTicks[i])
  };
  temp.reverse();
  var ticks = temp.concat(currentTicks);
  return ticks
};

function getSymbols(){
  tickers = [];
  var files = fs.readdirSync(test);

  files.forEach(function(file){
    if(file.search('BTCUSDT')== -1){
      //console.log(file);
      temp = file.slice(0, -5);
      tickers.push(temp);
    };
  });
  data = fs.readFileSync(test + "BTCUSDT.json",'UTF8');
    temp = JSON.parse(data);
    for(key in temp){
      time = Object.keys(temp[key]);
      if(temp[key][time].final == true){
        btc.push(temp[key]);
        //console.log(temp[key])
      };
    }; 
    timer = Object.keys(btc[50]);
    //console.log(timer);
  return tickers;
};

function prices(){
  var prices = {};
  tickers.forEach(function(pair){
      
      var data = fs.readFileSync(test + pair+'.json','UTF8');
        var ticks = JSON.parse(data);
        
        prices[pair] = ticks;
      
  });
  //console.log(prices);
return prices
};

function getSma(ticks){
  sma5 = 0;
  sma50 = 0;
  for(i = 0; i<49; i++){
    key = Object.keys(ticks[i]);
    sma50 = +sma50 + +ticks[i][key].close;
    if(i >= 44){
      sma5 = +sma5 + +ticks[i][key].close;
    }
  };
  //console.log(sma5);
  sma5 /= 5;
  sma50 /= 50;
  return {sma5, sma50};
};

function getVma(ticks, pair){
  vma5 = 0;
  vma50 = 0;
  for(i=0; i<49; i++){
    key = Object.keys(ticks[i]);
    vma50 = +vma50 + +ticks[i][key].volume;
    if(i >= 44){
      vma5 = +vma5 + +ticks[i][key].volume;
    }
  };
  vma5 /= 5;
  vma50 /= 50;
  //console.log(vma5);
  //console.log(vma50);
  return {vma5, vma50}
};
//end connection function
});
//console.log(files);