const crc=require ('crc');

function toTetrad(addr){
    // преобразовывает число в буфер из двух байт
    var h=Math.floor(addr/256); //HI byte
    var l=addr-h*256; //LO byte
    var arr= new Buffer([h,l]);
    //console.log("Adress="+addr+"="+arr.toString('hex'));
    return arr;
};

function getCRC(buf){
  // рассчитывает CRC для буфера buf и возвращает в виде буфера [LO,HI]
  let crc16=crc.crc16modbus(buf);
  let arr=[];
  crc16=toTetrad(crc16);
  arr.push(crc16[1]);
  arr.push(crc16[0]);
  let bufCRC=Buffer.from(arr);
  return bufCRC
}

module.exports.getCRC=getCRC;
module.exports.toTetrad=toTetrad;
