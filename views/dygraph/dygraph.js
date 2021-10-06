
var gr_data=[]; // данные для построения графиков
var gr_labels=[]; // метки данных
var graph; // модуль графика
window.onload=function(){
  //dygraph.
  getStartGraph(getDate()) ;
}
const grTrace=0;


 function graph_drawData() {
   let trace=1;
   let row=[];
   row[0]=new Date(realTimesData[ "Время" ])
   let isData=false;
   for (i=1;i<gr_labels.length;i++)
    {
        let val=realTimesData[ gr_labels[i] ].value;
        if (! val) {console.log("-----"+gr_labels[i]+"="+val)};
        (trace) ? console.log("DrawData.value= >> "+val) : null;
        if (val) {  isData=true };
        row.push(val);
    }
    if (isData) {
      trace ? console.log("Draw data: >> "+row) :null;
      gr_data.push(row);
      graph.updateOptions( { 'file': gr_data } );
    } else {
      (trace) ? console.log("graph_drawData:: array is emty. Cancel draw.") : null;
    }

 }


 function parseDataLine(arr){
   //принимает массив строку и возвращает массив [data, int,int,..]
   let res=[];
   for (let i = 0; i < arr.length; i++) {

     if (i == 0) {
       res[i]=new Date(arr[0])
     } else {
       let n=parseInt(arr[i]);
       res[i]=n
     }

   }//for
   return res
 }//parseDataLine


 function graph_addPoint(time,points){
   // time:Date,points:{Key:value}
   let trace=1;
   let m=[new Date(time)];
   let k=0;
   for (i=1;i<gr_labels.length;i++) {
       k=points[gr_labels[i]]
       if (k) {
         m[i]=k
       } else {
         m[i]=null;
       }
   }
   (trace) ? console.log("Draw data: >> "+m) : null;
   gr_data.push(m);
   graph.updateOptions( { 'file': gr_data } );

 }


 function getStartGraph(logName){
    let trace=1;
    // logName - имя файла лога без расширения
    let params='';

    if (logName) {
      params="logFileName="+encodeURIComponent(logName)
    } else {console.log("Must be log fName, but fName="+logName);return null}
     // 1. Создаём новый объект XMLHttpRequest
     var xhr = new XMLHttpRequest();
    // 2. Конфигурируем его: GET-запрос на URL 'phones.json'
    xhr.open('GET', '/temperature/startData?'+params, true);
    // 3. Отсылаем запрос на данные для инициализации
    xhr.onload = function(){

        let res=JSON.parse(xhr.responseText);
        (trace) ? console.log("Answer:"+xhr.responseText):null;
        gr_labels=res.headers;
        let data=res.data;
        /*if (grTrace) {
          console.log("");
          console.log(data);
        } ;*/
        for (var i = 0; i < data.length; i++) {
          // парсим данные
          gr_data.push(parseDataLine(data[i]));
        }

        // создаем график
        graph=new Dygraph(
            document.getElementById('dygraph'),
            gr_data,
            {
              //showRoller: true,
              valueRange: [0, 1100],
              title:"Самописец",
              ylabel:"Температура,*C",
              labels:gr_labels
            }
        )
        // организовываем запись
        setInterval(graph_drawData,5000);
      };

    xhr.onerror = function(){
      console.log("Error GET from /temperature/startData :"+xhr.status + ': ' + xhr.statusText)
      setTimeout(xhr.send(),2000);
    }
    xhr.send();
    // 4. Если код ответа сервера не 200, то это ошибка
    }
