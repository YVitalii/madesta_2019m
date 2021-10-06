/* --------------- миссия --------------------------------------
  промежуточное звено между потребителями данных и  сервером RS485
  отвечает на запросы get, set, проверяет данные на актуальность и тут же отправляет актуальные,
  если данные устарели инициирует запрос по RS485 для получения свежих данных,
  определяются 2 группы данных: оперативные (все что в очереди цикл.опроса) и настроечные(все остальные)
  ------  интерфейс ------


*/

//const queueOperative = require('./RS485_queue.js'); // запускаем циклический опрос регистров
const server=require('./RS485_server.js'); // запускаем сервер
// --------- настройки логера глобальные -------
const log = require('./log.js');
let logName="<"+(__filename.replace(__dirname,"")).slice(1)+">:";//имя модуля
let gTrace=0; //глобальная трассировка (трассируется все)
// gTrace ? log("i",logName,"get item=", item) : null;
// -- настройки логгера локальные--------------
//let logN=logName+"iterate():";  let trace=0;   trace = (gTrace!=0) ? gTrace : trace;
//trace ? log("w",logN,"Started") : null;
//trace ? log("i",logN,"Очередь пуста, курим :-)") : null;

const getFunc = require('./RS485_driver_get.js'); // считывание данных
const setFunc = require('./RS485_driver_set.js'); // запись данных

const queue=[];//очередь запросов

function set(arg,cb) {
  // запись постановка в очередь
  let item=[arg,setFunc,cb];
  queue.push(item);
  gTrace ? log("i",logName,"set item=", item) : null;
  gTrace ? console.log(queue) :null;
}
function get(arg,cb) {
  // чтение постановка в очередь
  let item=[arg,getFunc.get,cb];
  queue.push(item);
  gTrace ? log("i",logName,"get item=", item) : null;
  gTrace ? console.log(queue) :null;
}

function iterate() {
  // -- настройки логгера --------------
  let logN=logName+"iterate():";  let trace=0;   trace = (gTrace!=0) ? gTrace : trace;
  trace ? log("w",logN,"Started") : null;
  // проверяем длину очереди
  if (queue.length == 0) {
    // очередь пуста, курим 1 сек
    trace ? log("i",logN,"Очередь пуста, курим :-)") : null;
    setTimeout(() =>{iterate()}, 1000);
    return
  }
  // в очереди есть задания, берем первое
  let [arg,taskFunc,cb]=queue.shift();
  trace ? log("i","taskFunc=") :null;
  trace ? console.log(taskFunc) : null;
  taskFunc(arg,(err,data)=>{
    iterate();
    return cb(err,data)
  });
}  //iterate




iterate();
module.exports.getValues=getFunc.getValues;//синхронная
module.exports.get=get;
module.exports.set=set;
// -------------  testing ---------------------
if (! module.parent) {
  /*arg="1-tT=650;2-tT=750"// 3-tT=850"
  set(arg,(err,data)=>{
    let logN=logName+"set("+arg+"):\n";
    if (err) {log("e",logN,"error=",err)}
    //if (data) {log("i",logN,"data=",data)}
    log('w',"callback set: ----------")
    console.group(data);
  });*/
  arg="T1;T2;T3"// 3-tT=850"
  get(arg,(err,data)=>{
    let logN=logName+"set("+arg+"):\n";
    if (err) {log("e",logN,"error=",err)}
    //if (data) {log("i",logN,"data=",data)}
    log('w',"callback get: ----------")
    console.group(data);
  });
  // testing getValues
  /*setInterval(()=>{
    log("i",logName,"getValues=",getFunc.getValues("T1;T2;T3"));
  }, 2000)*/

  //log("i",logName,"getValues=",getValues('T1;T2;T3'));
}//if (! module.parent)
