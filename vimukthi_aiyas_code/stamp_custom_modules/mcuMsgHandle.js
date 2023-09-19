/*
This module read and strip data from a given 20byte fix serial data buffer
*/

const {crc16} = require('easy-crc');
var conv = require('hex2dec');

var totalBufIn = Buffer.alloc(20);
var dataBufIn = Buffer.alloc(15);
var checksmIn = Buffer.alloc(2);
var msgIdIn = 0;
var totalBufOut = Buffer.alloc(20);
var dataBufOut = Buffer.alloc(15);
var checksmOut = Buffer.alloc(2);

//Data from MCU - mode 1
class DataMcuM0 {
	constructor(volt,curr,powr){
		this.volt = volt;
		this.curr = curr;
		this.powr = powr;
    }
	getData(){
		return [this.volt,this.curr,this.powr,'0'];
		}  
};

//Data from MCU - mode 2
class  DataMcuM1{
	constructor(kwh,t1,t2,t3){
		this.kwh = kwh;
		this.t1 = t1;
		this.t2 = t2;
		this.t3 = t3;
		}
		getData(){
			return [this.kwh,this.t1,this.t2,this.t3];
			}
};

var mcuDataM0 = new DataMcuM0(0.0,0.0,0.0);
var mcuDataM1 = new DataMcuM1(0.0,0,0,0);


/*
This fucntion updates class DataMcuM0 and DataMcuM1

Input = 20 byte serial input as a buffer


*/
function mcuMsgDecode(buf){
	totalBufIn = buf;
	
	try{
		if(totalBufIn.slice(0,1).toString('hex') == '23'){
			checksmIn = conv.hexToDec(totalBufIn.slice(16,18).swap16().toString('hex'));
			dataBufIn = totalBufIn.slice(1,16);
			msgIdIn = conv.hexToDec(totalBufIn.slice(9,10).toString('hex'));
			
			if(conv.hexToDec(crc16('MODBUS',dataBufIn).toString(16)) == checksmIn){
				//console.log("CRC PASSED");
				if(msgIdIn == 0){
					mcuDataM0.volt = conv.hexToDec(totalBufIn.slice(10,12).swap16().toString('hex'));
					mcuDataM0.curr = conv.hexToDec(totalBufIn.slice(12,14).swap16().toString('hex'));
					mcuDataM0.powr = conv.hexToDec(totalBufIn.slice(14,16).swap16().toString('hex')); 
					} 
				else if(msgIdIn == 1){
					mcuDataM1.kwh = conv.hexToDec(totalBufIn.slice(10,12).swap16().toString('hex'));
					mcuDataM1.t1 = conv.hexToDec(totalBufIn[12].toString(16));
					mcuDataM1.t2 = conv.hexToDec(totalBufIn[13].toString(16));
					mcuDataM1.t3 = conv.hexToDec(totalBufIn[14].toString(16));			   
					}
			}
			else{
				console.log("CRC FAIL"); 
			}
		}
		
		
		
	}
	catch(error){
		console.error(error);
		return -1
	}
		
	return 0;
}

function mcuMsgEncode(state,port,parser){
	
	switch(state){
		case 'A':dataBufOut = Buffer.from([0x4E,0x41,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);break;
		case 'B':dataBufOut = Buffer.from([0x4E,0x42,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);break;
		case 'C':dataBufOut = Buffer.from([0x4E,0x43,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);break;
		case 'D':dataBufOut = Buffer.from([0x4E,0x44,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);break;
		case 'E':dataBufOut = Buffer.from([0x4E,0x45,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);break;
		case 'F':dataBufOut = Buffer.from([0x4E,0x46,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);break;
		default:dataBufOut = Buffer.from([0x4E,0x46,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);break;
	}
	
	checksmOut = crc16('MODBUS',dataBufOut);
	totalBufOut= Buffer.concat([Buffer.from([0x23]), dataBufOut, Buffer.from(checksmOut.toString(16).padStart(4,'0'),'hex').swap16(),Buffer.from([0x2a,0x0a])],20);
	console.log(totalBufOut);
	try{
		port.write(totalBufOut.toString('hex'), function(err) {
			if (err) {
				return console.log('Error on write: ', err.message)
				} 
				//console.log(totalBufOut.toString('hex'));
			});
		}
	
	catch(error){
		console.error(error);
		return -1
		}
	return 0;
}

function getMCUData(what){
	switch(what){
		case 'Mode0':
			return mcuDataM0.getData();break;
		case 'Mode1':
			return mcuDataM1.getData();break;
		default :
			return [0,0,0,0];break;
			
	}
}

module.exports = {mcuMsgDecode,mcuMsgEncode,getMCUData};
