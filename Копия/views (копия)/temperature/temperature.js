
//var T_headers=
var realTimesData={};
var tempErrorMax=5 // максимальное кол-во ошибок
var tempErrorCounter=0 // счетчик ошибок

// 1. Создаём новый объект XMLHttpRequest
var xhrT = new XMLHttpRequest();

function realTimeDataParse(res) {
  for (key in res) {
    let item=document.getElementById(key);
    if (item) {
      let val= (res[key].value === null) ?  "???" : res[key].value;
      if (key.includes('state')){
        val=parseInt(val);
        switch (val) {
          case 7:
            item.style.color="blue"
            val="Стоп";
            break;
          case 23:
            item.style.color="green"
            val="Пуск";
            break;
          case 71:
            item.style.color="red"
            val="(!)Стоп";
            break;
          case 87:
            item.style.color="red"
            val="(!)Пуск";
            break;
          default:
            item.style.color="red"
            val="???";
        }
      }
      item.innerHTML=val;
    }
  }
}
// 3. Отсылаем запрос
xhrT.onload = function(){
   let trace=0;
   let now = (new Date()).toLocaleString();
   (trace) ? console.log(now):null;
   let res=JSON.parse(xhrT.responseText);
   realTimesData=res;
   (trace) ? console.log("Get Realtimes::: Answer:"):null;
   (trace) ? console.log(realTimesData):null;
   realTimeDataParse(res);
   tempErrorCounter=(tempErrorCounter<=0) ? 0 : tempErrorCounter-=1;
 }//onload

xhrT.onerror = function(){
  //если ошибка
 let trace=1;
 let header="getRealTimes. Error.";
 console.log("Error GET from /realtimes :"+xhrT.status + ': ' + xhrT.statusText)

 // проверяем кол-во ошибок
 tempErrorCounter+=1;
 trace ? console.log(header+"tempErrorCounter="+tempErrorCounter):null
 if (tempErrorCounter>tempErrorMax) {
   // кол-во ошибок превысило tempErrorMax
   // обнуляем данные
   trace ? console.log(header+"Кол.ошибок превысило предел обнуляем tempErrorCounter="+tempErrorCounter):null;
   trace ? console.log(header+"realTimesData="+realTimesData):null;
   tempErrorCounter=tempErrorMax; //останавливаем счетчик
   for (key in realTimesData) {
     realTimesData[key].value=null;
   }
   //вызываем обработчика
   realTimeDataParse(realTimesData);
 }
 // повторно отправляем запрос через 2 сек
 setTimeout(xhrT.send(),2000);

}



var askT = setInterval(function(){xhrT.open('GET', '/realtimes', true); xhrT.send()},3000);
