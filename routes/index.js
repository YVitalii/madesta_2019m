var express = require('express');
var router = express.Router();
var RS485 = require('../RS485/RS485_driver.js');
const config = require('../config.js');
//const logger = require('../logger');
var T_headers=config.logger.listReg+";1-state"+";2-state"+";3-state"//.split(";");
var trace=true;
// --------- настройки логера глобальные -------
const log = require('../log.js');
let logName="<"+(__filename.replace(__dirname,"")).slice(1)+">:";//имя модуля
let gTrace=0; //глобальная трассировка (трассируется все)
// gTrace ? log("i",logName,"get item=", item) : null;
const logsManager = require('../logger/logDir.js');

//const logs = require('./logs');
/* GET home page. */
router.get('/', function(req, res, next) {
  (trace) ? console.log("GET /"+T_headers) : null;
  res.render('work', {T_headers});
});

router.get('/temperature/startData', function(req, res, next) {
  let trace=0;
  res.set('Content-Type', 'application/json');
  (trace) ? console.log("Start data: >>>>"): null;
  (trace) ? console.log(req.query): null;
  logsManager.getFullLog(req.query['logFileName'],(err,data) =>{
    if (err) {
      // если ошибка передаем только заголовки и пустой массив
      console.log(err);
      data.headers=T_headers;
      data.data=[];
      let arr=[];
      for (var i = 0; i < T_headers.length; i++) {
        if (i == 0){
          arr[i]=(new Date()).getTime().toString();
        } else { arr[i]=null;}
      } // for
      data.data.push(arr);
    }
    res.send(JSON.stringify(data));
    (trace) ? console.log(JSON.stringify(T_headers)): null;
  });

});



router.get('/realtimes', function(req, res, next) {
  // -- настройки логгера локальные--------------
  let logN=logName+"get('/realtimes')>";  let trace=0;   trace = (gTrace!=0) ? gTrace : trace;
  trace ? log("w",logN,"Started") : null;

  res.set('Content-Type', 'application/json');
  //let T={};
  t=RS485.getValues(T_headers);
  t["Время"]=(new Date()).getTime();
  trace ? log("w",logN,"data=",t) : null;
  let msg=JSON.stringify(t);
  res.send(msg);
}); //get('/realtimes'

module.exports = router;

function getT(){
  // заглушка
  let max=850;
  let min=20;
  return Math.round((Math.random() * (max - min) + min));
}
