


const server=require('./RS485_server.js'); // запускаем сервер
// -------------- логгер -----------------
const log = require('./log.js'); // логер
let logName="<"+(__filename.replace(__dirname,"")).slice(1)+">:";
let gTrace=0; //глобальная трассировка (трассируется все)

const SerialTasks=require('./serialTasks.js'); //последовательное выполнение задач
const TrySomeTimes = require('./trySomeTimes.js');//несколько попыток выполнения задачи

function setOne(arg,cb) {
  // записывает в прибор одно значение регистра
  // arg - строка вида regName=value
  // возвращает cb(err,data={name:"",value: ,...})
  //

  // ----------- настройки логгера --------------
  let logN=logName+"setOne("+arg+"):";  let trace=0;   trace = (gTrace!=0) ? gTrace : trace;
  trace ? log("i",logN,"Started") : null;
  // парсим аргументы
  let [name,value]=arg.split("=");
  // проверяем наличие запрашиваемого регистра в реестре, если нет - ошибка
  trace ? log("i",logN,"  проверяем наличие запрашиваемого регистра:",name) : null;
  if (! server.has(name)) {
    let err=new Error("Регистра "+name+" нет в реестре")
    trace ? log("e",logN," err=",err.message) : null;
    process.nextTick(() => { cb(err,null)});
    return
  }
  // считываем данные зарегистра
  trace ? log("i",logN,"  считываем данные зарегистра") : null;
  let oldData=server.get(name);
  trace ? log("i",logN," now ", name,"=",oldData) : null;
  // проверяем не совпадает ли записываемое и текущее значения, если совпадают возвращаем данные из реестра
  trace ? log("i",logN,"  проверяем на совпад.новое и тек. знач. nowValue=",oldData.value,"; newValue=",value) : null;
  if (oldData.value == (+value)) {
    // данные совпадают, ничего не делаем
    trace ? log("i",logN," данные: ",value, " не изменились, пропускаем") : null;
    process.nextTick(() => { cb(null,oldData)});
    return
  }
  // записываем данные
  trace ? log("i",logN,"записываем данные:", arg) : null;

  server.write(arg,(err,data)=>{
    // 1-я попытка
    if (! err) {
      trace ? log("i",logN,"Попытка записи 1 успешна, отсылаем данные:", data) : null;
      return cb(err,data); //успешная попытка записи - выход
    }
    trace ? log("e",logN,"Попытка записи 1 не удалась err=",err) : null;
    // если таймаут, то вторая попытка записи
    if (err.code == 13) {
        trace ? log("w",logN,"Timeout. Попытка записи 2,3:") : null;
        new TrySomeTimes(arg,2,server.write, (err,data)=>{
          if (err) {
            // 2 попытки записи не удачны, возвращаем ошибку и старые данные
            return cb(null,server.get(name));
          }
          return
        });//TrySomeTimes


      } else {//if err.code != 13
      trace ? log("e",logN,"Неустранимая ошибка записи, отсылаем старые данные:", data) : null;
      return cb(err,server.get(name));}
  });

}//setOne

function set(request,cb) {
  // request - строка с именами(алиасами)регистров=значение и разделителями: \t или ";"
  // например: "T1=250;T2=750;T3=450"
  // ответ - { regName1:{value:  , ...},regName2:{value:  , ...},...}
  // -- настройки логгера --------------
  let logN=logName+"set("+request+"):";  let trace=0;   trace = (gTrace!=0) ? gTrace : trace;
  trace ? log("w",logN,"Started") : null;
  // парсим входные данные
  let items=[];// массив запросов
  items= request.includes("\t") ? request.split("\t") :[];
  items= request.includes(";") ? request.split(";") :[];
  if (items.length == 0) { items.push(request) } // на случай запроса с одним регистром, т.е. без разделителей
  trace ? log("w",logN,"Запрос:",items) : null;
  // записываем по очереди все регистры
  new SerialTasks(items,setOne,(err,data) => {
    //if (err) {log("e",logN,"error=",err)}
    //if (data) {log("i",logN,"data:=",data)}
    return cb(err,data);
  });
}


module.exports=set;




// ---------------  тестирование -----------------------
if (! module.parent) {
  /*setOne("null=10",()=>{}); // несуществующий регистр
  setOne("1-state=10",()=>{}); //неверное значение
  setOne("1-state=aa",()=>{}); //нечисловое значение
  setOne("1-state=17",()=>{
    setOne("1-state=17",()=>{}); //повторный пуск
  }); //Пуск*/

  /*let arg="T1=25;T2=35;1-tT=350;2-tT=450; 3-tT=550"
  set(arg,(err,data)=>{
    let logN=logName+"set("+arg+"):\n";
    if (err) {log("e",logN,"error=",err)}
    //if (data) {log("i",logN,"data=",data)}
    console.group(data);
  });*/
  arg="1-tT=650;2-tT=750"// 3-tT=850"
  set(arg,(err,data)=>{
    let logN=logName+"set("+arg+"):\n";
    if (err) {log("e",logN,"error=",err)}
    //if (data) {log("i",logN,"data=",data)}
    log('w',"callback set: ----------")
    console.group(data);
  });
};
