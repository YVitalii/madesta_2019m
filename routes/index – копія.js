var express = require('express');
var router = express.Router();
var RS485 = require('./RS485/workerRS485.js');
var T_headers=["Время",'T01','T02','T03','T04','T05','T06','T07','T08','T09','P',"N2"];
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('work', {T_headers});
});

router.get('/temperature/startData', function(req, res, next) {
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify({headers:T_headers, data:[]}));
  console.log(JSON.stringify(T_headers));
});

router.get('/realtimes', function(req, res, next) {
  res.set('Content-Type', 'application/json');
  let T={};
  T=RS485.getValues()
  T[T_headers[0]]=(new Date()).getTime();

  /*for (i=0;i<T_headers.length;i++ ) {
    if (i!=0){
    T[T_headers[i]]=getT();
  } else {T[T_headers[0]]=(new Date()).getTime() }
};*/
  let msg=JSON.stringify(T)
  console.log("T="+msg);
  res.send(msg);
  //console.log(JSON.stringify(T));
});

module.exports = router;

function getT(){
  // заглушка
  let max=850;
  let min=20;
  return Math.round((Math.random() * (max - min) + min));
}
