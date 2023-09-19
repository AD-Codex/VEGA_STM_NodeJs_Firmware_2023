// ---------------------------------------------------------------------
const {SerialPort} = require('serialport');
var protocol_status = 0;

// open port
// const portS1 = new SerialPort({ path: '/dev/ttyS1', baudRate: 9600});

// const fs = require('fs');

// var address = 0x80000000;

// binFile = fs.readFileSync('/TEST/serial/PWM.bin');

// console.log('end address : ');
// console.log(address+binFile.length);


// function delay(time) {
//   return new Promise(resolve => setTimeout(resolve, time));
// } 

// run();
// console.log('adfsvss');
// console.log('dn fhm');

// async function run() {
//   await delay(1000);
//   console.log('This printed after about 1 second');
//   await delay(1000);
//   console.log('This printed after about 2 second');
// }


console.log('start');
console.log('\rhyvjgvstart');
process.stdout.write("wrgwrg ");
process.stdout.write(" dfb");

// // serial read -----------------------------
// function serial_read() {
// 	portS1.on('data',function(data){
// 		if (data == 0x23){
// 			console.log("done");
// 		}
// 		console.log(data)
// 	});
// }
// portS1.on('open', serial_read);
// // -------------------------------------------



// // Read Serial data -------------------------------------------------
// portS1.on("open", function() {
// 	console.log("--Connection opend--");
// 	portS1.on("data", function(data) {
// 		console.log(data);
// 		if (data.slice(0,1).toString('hex') == 23){
// 			console.log("done");
// 			protocol_status = protocol_status +1;
// 		}
// 	});
// });
// // ---------------------------------------------------------------------------


// // loop example --------------------
// function Load() {
// 	setTimeout(function() {
// 		console.log('processing');
// 		if ( protocol_status == 0 ) {
// 			console.log("done--------------------: " + protocol_status);
// 		}
// 		else if ( protocol_status == 1 ) {
// 			console.log("done--------------------: " + protocol_status);
// 		}
// 		else if ( protocol_status == 2 ) {
// 			console.log("done--------------------: " + protocol_status);
// 		}
// 		else if ( protocol_status == 3 ) {
// 			console.log("done--------------------: " + protocol_status);
// 		}
// 		Load();
// 	},2000)
// }
// Load();
// // -------------------------------------


// // hex write -------------------------------
// var value = Buffer.from([0x49]);
// portS1.write( value.toString('hex'), function(err) {
// 	if (err) {
// 		console.log('err -----------------------------------------------');
// 	}
// 	console.log(value);
// });
// // -----------------------


// // //Write Serial data after delay
// async function uart_write() {
// 	await delay(5000);
// 	portS1.write("Hello");
// 	console.log("data received-----------------++++++++++++++++++++++++: ");
// }
// uart_write();


// ------------------------------------------------------------------

// // shell run ------------------------------------------------
// const { exec } = require("child_process");
// exec("ls -la", (error, stdout, stderr) => {
// 	if (error) {
// 		console.log('error: ${error.message}');
// 		return;
// 	}
// 	console.log('stdout: %s', stdout);
// });
// -------------------------------------------------------------


