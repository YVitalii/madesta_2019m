var express = require('express');
var router = express.Router();
const thermProcess = require('../RS485/thermProcess.js');





/* GET users listing. */
router.post('/', function(req, res, next) {
  console.log("--------------in /program");
  
  //res.render('work', {T_headers});
  //res.render('programs',{});

  /*for (var key in rq.body) {
    let val;
    if ( key != "tT") {
      let arr=(req.body[key]).split(":")
      req.body[key]=arr[0]*60+arr[1];
    }
  }*/
  console.log("req.body=");
  console.log(req.body['req[0][tT]']);

  let arg=[
    {
      tT:req.body['req[0][tT]'],
      H:req.body['req[0][H]'],
      Y:req.body['req[0][Y]']
    },
    {
      tT:req.body['req[1][tT]'],
      H:req.body['req[1][H]'],
      Y:req.body['req[1][Y]']
    }
  ];

  console.log("arg=");
  console.log(arg);
  console.log(thermProcess);
  thermProcess.startProgram(arg);
  //={"tT":req.body.tT,"H":req.body.H,"Y":req.body.Y};//req.body;
  //console.log("arg=");
  //console.log(arg);
  //thermProcess.startProgram(arg);
  //

  res.set('Content-Type', 'plain/text');
  res.send(' respond with a resource');
});

module.exports = router;
