/*
This module has 3 functions

function 1 : pageChange(state)
	input => state <- integer of {66-75}

	Command to change the page and stay on the same page.
	when this function called once, the page will be changed from teh current page and 
	start upadating values related to the page
	
function 2 : readMCUData(mode) 
	input => mode <- string of {'Mode0','Mode1'}
	output => [value1, value2, value3, value4] <- string 

function 3 : writeMCUData(key,value)	
	input => state <-  {'A'}				
	output => if successful 0
			  
fucntion 4 : object newTap
	methods, 
		getTapString() output => "x,x,x,x,x,x,x,x"
		
*/


const {SerialPort} = require('serialport');
const {ByteLengthParser}= require('@serialport/parser-byte-length');
const {ReadlineParser} = require('@serialport/parser-readline');
const {exec}=require("child_process");
const {execSync} = require('child_process');

var obj = require("./stamp_custom_modules/mcuMsgHandle");
var objTap = require("./stamp_custom_modules/tapcardGet");
var objNet = require("./stamp_custom_modules/networkCheck");

/*
ttyS1 is the serial UART1 communicating with the MCU
ttyS2 is the serial FUART1 communicating in the RS485 Bus
ttyACM0 is the USB serial communicating with the  in the tap card
*/

const portS1 = new SerialPort({ path: '/dev/ttyS1', baudRate: 9600,parity: 'even' }); 
const portS2 = new SerialPort({ path: '/dev/ttyS2', baudRate: 9600}); 
const portACM0 = new SerialPort({ path: '/dev/ttyACM0', baudRate: 9600});
const parserFixLen = portS1.pipe(new ByteLengthParser({ length: 20 }));
const parserReadLn = portACM0.pipe(new ReadlineParser({ delimiter: '\r\n'}));

/*Display*/

const fs = require('fs');
const fifoPath = '/tmp/my_fifo';

var i = 0;
var t = 1;
var heatWarning = 0;
var displayState = 66;
var networkConnectivity = 0;
var networkStrength = 1;
var tapcardString = '';
var tapcardDetect = 0;
var displayString = '';
var fastDisplayUpdate = 0;
let pipeID;
let pipeIDFast;

//Internal function used by this module
//-------------------------------------

function listenTapCard(){
	console.log('open-tap');
	parserReadLn.on('data',function(data){
		
		newTap.tapString = objTap.tapcardNoGet(data);
		newTap.tap = 1;
		//console.log(tapcardString);
		
	});
}

function readMCU(){
	console.log('opened');
	parserFixLen.on('data', function(data){
		if(obj.mcuMsgDecode(data) == 0){ 
			//nothing to be  done, calling mcuMsgDecode also save latest values
		}
		
	});
}

function updateNet(){
	//console.log('open-net');
	networkConnectivity = objNet.netwrokStatusGet();
	networkStrength = objNet.networkStrengthGet();
	//console.log(networkStrength)
}

function updateDisplay(displayState,id){
	
	/*mcu data collect and analize*/
	mcuData = obj.getMCUData('Mode1');
	// heat
	if (mcuData[1]>65){heatWarning = 1;}
	else{heatWarning = 0;}
	
	
	console.log("*************************");
	
	
	/*update display state based on mcu data and network data*/
	switch(displayState){
		case 66: //LOADING
			displayString = '{ \"page\":66,\"wifi\":'+networkStrength.toString()+',\"heat\":'+heatWarning.toString()+'}';
			break;
			
		case 68: //LAST CHARGE
			if(i<1){
				displayString = '{ \"page\":68,\"id\":\"A1234\",\"kwh\":34.7,\"cost\":'+mcuData[1].toString()+',\"time\":6789,\"bal\":6789.1,\"error\":'+mcuData[1].toString()+',\"warn\":3,\"cur\":34.9,\"timer\":'+t.toString()+',\"wifi\":'+networkStrength.toString()+',\"updatePage\":1,\"heat\":'+heatWarning.toString()+'}';
				i++;
			}
			else{
				displayString = '{ \"page\":68,\"id\":\"A1234\",\"kwh\":34.7,\"cost\":'+mcuData[1].toString()+',\"time\":6789,\"bal\":6789.1,\"error\":'+mcuData[1].toString()+',\"warn\":3,\"cur\":34.9,\"timer\":'+t.toString()+',\"wifi\":'+networkStrength.toString()+',\"updatePage\":0,\"heat\":'+heatWarning.toString()+'}';
			}
			
			break;
			
		case 69: //VERIFING 
			if(i<1){
				displayString = '{ \"page\":69,\"id\":\"A1234\",\"wifi\":'+networkStrength.toString()+',\"updatePage\":1,\"heat\":'+heatWarning.toString()+'}';
				i++;
				tapcardDetect = 0;
			}
			else{
				displayString = '{ \"page\":69,\"id\":\"A1234\",\"wifi\":'+networkStrength.toString()+',\"updatePage\":0,\"heat\":'+heatWarning.toString()+'}';
			}
			break;
			
		case 70:// LOADING
			if(i<1){
				displayString = '{ \"page\":70,\"wifi\":'+networkStrength.toString()+',\"updatePage\":1,\"heat\":'+heatWarning.toString()+'}';
				i++;
				}
			else{
				displayString = '{ \"page\":70,\"wifi\":'+networkStrength.toString()+',\"updatePage\":0,\"heat\":'+heatWarning.toString()+'}';
				}
			break;
		
		case 71: //FAILED
			if(i<1){
				displayString = '{ \"page\":71,\"id\":\"A1234\",\"wifi\":'+networkStrength.toString()+',\"updatePage\":1,\"heat\":'+heatWarning.toString()+'}';
				i++;
				}
			else{
				displayString = '{ \"page\":71,\"id\":\"A1234\",\"wifi\":'+networkStrength.toString()+',\"updatePage\":0,\"heat\":'+heatWarning.toString()+'}';
				}
			break;
		
		case 72: //PLUG your EV
			if(i<1){
				displayString = '{ \"page\":72,\"id\":\"A1234\",\"wifi\":'+networkStrength.toString()+',\"time\":0000,\"bal\":1000.5,\"updatePage\":1,\"heat\":'+heatWarning.toString()+'}';
				i++;
				}
			else{
				displayString = '{ \"page\":72,\"id\":\"A1234\",\"wifi\":'+networkStrength.toString()+',\"time\":0000,\"bal\":1000.5,\"updatePage\":0,\"heat\":'+heatWarning.toString()+'}';
				if(fastDisplayUpdate){
					clearInterval(id);
					let pipeIDFast = setInterval(() => updateDisplay(displayState,pipeIDFast),900);
					fastDisplayUpdate = 0;
				}
				}
			break;
		
		case 73: //Charging
			if(i<1){
				displayString = '{ \"page\":73,\"id\":\"A1234\",\"kwh\":34.7,\"cost\":'+mcuData[1].toString()+',\"time\":6789,\"bal\":6789.1,\"error\":'+mcuData[1].toString()+',\"warn\":3,\"cur\":34.9,\"timer\":1,\"wifi\":'+networkStrength.toString()+',\"updatePage\":1,\"heat\":'+heatWarning.toString()+'}';
				i++;
			}
			else{
				displayString = '{ \"page\":73,\"id\":\"A1234\",\"kwh\":34.7,\"cost\":'+mcuData[1].toString()+',\"time\":6789,\"bal\":6789.1,\"error\":'+mcuData[1].toString()+',\"warn\":3,\"cur\":34.9,\"timer\":0,\"wifi\":'+networkStrength.toString()+',\"updatePage\":0,\"heat\":'+heatWarning.toString()+'}';
				if(fastDisplayUpdate){
					clearInterval(id);
					let pipeIDFast = setInterval(() => updateDisplay(displayState,pipeIDFast),900);
					fastDisplayUpdate = 0;
				}
				
			}
			break;
			
		case 74: //UNPLUG your EV
			if(i<1){
				displayString = '{ \"page\":74,\"id\":\"A1234\",\"wifi\":'+networkStrength.toString()+',\"time\":0000,\"cost\":1000.5,\"kwh\":34.7,\"updatePage\":1,\"heat\":'+heatWarning.toString()+'}';
				i++;
				}
			else{
				displayString = '{ \"page\":74,\"id\":\"A1234\",\"wifi\":'+networkStrength.toString()+',\"time\":0000,\"cost\":1000.5,\"kwh\":34.7,\"updatePage\":0,\"heat\":'+heatWarning.toString()+'}';
				}
			break;
		
		case 75: //ERROR
			if(i<1){
				displayString = '{ \"page\":75,\"id\":\"A1234\",\"wifi\":'+networkStrength.toString()+',\"time\":0000,\"cost\":1000.5,\"kwh\":34.7,\"error\":1,\"updatePage\":1,\"heat\":'+heatWarning.toString()+'}';
				i++;
				}
			else{
				displayString = '{ \"page\":75,\"id\":\"A1234\",\"wifi\":'+networkStrength.toString()+',\"time\":0000,\"cost\":1000.5,\"kwh\":34.7,\"error\":1,\"updatePage\":0,\"heat\":'+heatWarning.toString()+'}';
				}
			break;
			
		case 76: //WARNING
			if(i<1){
				displayString = '{ \"page\":76,\"id\":\"A1234\",\"wifi\":'+networkStrength.toString()+',\"time\":0000,\"cost\":1000.5,\"kwh\":34.7,\"warn\":1,\"updatePage\":1,\"heat\":'+heatWarning.toString()+'}';
				i++;
				}
			else{
				displayString = '{ \"page\":76,\"id\":\"A1234\",\"wifi\":'+networkStrength.toString()+',\"time\":0000,\"cost\":1000.5,\"kwh\":34.7,\"warn\":1,\"updatePage\":0,\"heat\":'+heatWarning.toString()+'}';
				}
			break;
				displayString = '{ \"page\":66,\"wifi\":'+networkStrength.toString()+',\"heat\":'+heatWarning.toString()+'}';
				break;
			
	}
	
	
	console.log("writing to page: ",displayState,mcuData[1],networkStrength);
	
	
	//wrirng to page
	
	const fd = fs.openSync(fifoPath, 'w');
	const data = displayString;
	fs.writeSync(fd, data.padEnd(150));
	fs.closeSync(fd);
	
	
	
}

function bye(){
	console.log('Gracefully died, Peace!!!');
    process.exit();
}

function halfbye(){
	console.log('Not gracefully died, No Peace!!!');
    process.exit();
}

function gracefulDead(){
	
	//releasing CID in qmicli
	var qmclicmd3 = "qmicli --device=/dev/cdc-wdm0 --nas-noop --client-cid="+  objNet.networkCIDGet().toString();
	var releaseCIDPromise = new Promise((resolve,reject) => {
									exec(qmclicmd3,(error, stdout, stderr) => {
										if (error){
											console.log(`error: ${error.message}`);
											reject();
											return;
											} 
										if (stderr){
											console.log(`stderr: ${stderr.message}`);
											reject();
											return;
											}
										console.log("CID clear ",objNet.networkCIDGet());
										resolve();
										}) 
										
								});
	
	releaseCIDPromise.then(bye,halfbye);
	
}

//Functions exposed from this module
//-------------------------------------

function readMCUData(mode){
	return obj.getMCUData(mode)
}

function pageChange(newDiaplayState){
	
	var dummyID = setInterval(() => {},0)
	while(dummyID--){ 
		clearInterval(dummyID);
		//console.log("clear time interval id")
		} 
	
	if ((newDiaplayState == 72) || (newDiaplayState == 73) ){
		fastDisplayUpdate = 1;
	}
	
	let pipeID = setInterval(()=>updateDisplay(newDiaplayState,pipeID),2000);
	
	
}

class tap {
	constructor(tap,tapString){
		this.tap = tap;
		this.tapString = tapString;
    }
	getTap(){
		return this.tap;
		} 
	getTapString(){
		return this.tapString;
	}
};
var newTap = new tap(0,'');

function writeMCUData(msg){
	return obj.mcuMsgEncode(msg,portS2,parserFixLen)
}


// Async running functions

/* Read from MCU */
portS1.on('open',readMCU);



		
/* Read from Tap Card*/
portACM0.on('open',listenTapCard);


/*Updating network status*/
let networkcheckID = setInterval(()=>updateNet(),5000);




/*Graceful kill*/
process.on('SIGINT', gracefulDead);
process.on('SIGTERM', gracefulDead);

module.exports = {readMCUData,pageChange,newTap,writeMCUData}

/*
Appendix:

{"page":67, "wifi":3, "heat": 1}                                       //ALL
{"page":68,"kwh":21.1,"cost":500.00,"time":7568,"wifi":3, "heat": 1}                       // Last CHARGE
{"page":69,"id":"C8689","wifi":3, "heat": 1}                                               // VERIFYING
{"page":70,"wifi":3, "heat": 1}                                                            // LOADING
{"page":71,"id":"F0900","wifi":3, "heat": 1}                                               //FAILED
{"page":72,"id":"A0090", "bal":8000,"time":8400,"wifi":3, "heat": 1}                       //PLUG YOUR EV
{"page":73,"id":"H0890","cur":21.3,"kwh":24.1,"cost":10000.50,timer:1,"wifi":3, "heat": 1}   // CHARGING
{"page":74,"id":"A0990","kwh":88.9,"cost":90000.98,"time":256400,"wifi":3, "heat": 1}      //UNPLUG YOUR EV
{"page":75,"id":"F7890","kwh":40.7,"cost":9087,"time":89769,"error":92,"wifi":3, "heat": 1} //ERROR
{"page":76,"id":"F0989","kwh":40.7,"cost":8907,"time":6789,"warn":2,"wifi":3, "heat": 1}    //WARNING

***Must add 150 PAD before write JSON
  // Write the data to the named pipe 
  fs.writeSync(fd, data.padEnd(150)); // Node code

page 67-76
wifi 0-3
heat 0,1
timer 0,1
time Total time in seconds
id String

Command flow for charging page:
{"page":73,"id":"H0890","cur":21.3,"kwh":24.1,"cost":0,timer:1,"wifi":3, "heat": 1} // First Start timer.(timer:1)
// Then continuously update current,kwh & cost.(timer:0)
{"page":73,"id":"H0890","cur":49.8,"kwh":55.6,"cost":100.50,timer:0,"wifi":3, "heat": 1}


command to write in to pipe
'{ \"page\":'+page.toString()+',\"id\":\"A1234\",\"kwh\":34.7,\"cost\":'+mcuData[1].toString()+',\"time\":6789,\"bal\":6789.1,\"error\":'+mcuData[1].toString()+',\"warn\":3,\"cur\":34.9,\"timer\":'+t.toString()+',\"wifi\":2,\"heat\":'+heatWarning.toString()+'}' ;

*/

