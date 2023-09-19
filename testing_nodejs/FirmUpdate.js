

var gpio_boot0 = 13;
var gpio_reset = 12;

var protocol_status = 0;
var address_send = 0;

const {exec} = require("child_process");
const {SerialPort} = require('serialport');
const {execSync} = require('child_process');


const portS1 = new SerialPort({ path: '/dev/ttyS1', baudRate: 9600});

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
} 


// booto set


// Shell exec
function shellOut(msg) {
	console.log(msg);
	exec(msg, (error, stdout, stderr) => {
		if (error) {
			console.log('error: %s', error);
			return;
		}
		if (stderr) {
			console.log('stderr: %s', stderr);
			return;
		}
		if (stdout) {
			console.log('stdout: %s', stdout);
			return;
		}
	});
}



// shellOut("ls");


// ---------------------- gpio pin set


var gpio_set = "echo " + gpio_boot0 + " > /sys/class/gpio/unexport";
shellOut(gpio_set);
execSync('sleep 1');
var gpio_set = "echo " + gpio_boot0 + " > /sys/class/gpio/export";
shellOut(gpio_set);
execSync('sleep 1');

var gpio_direc = "echo out > /sys/class/gpio/gpio" + gpio_boot0 + "/direction";
shellOut(gpio_direc);
execSync('sleep 1');


var gpio_set = "echo " + gpio_reset + " > /sys/class/gpio/unexport";
shellOut(gpio_set);
execSync('sleep 1');
var gpio_set = "echo " + gpio_reset + " > /sys/class/gpio/export";
shellOut(gpio_set);
execSync('sleep 1');

var gpio_direc = "echo out > /sys/class/gpio/gpio" + gpio_reset + "/direction";
shellOut(gpio_direc);
execSync('sleep 1');



// ------------------------ gpio BOOT0 set high

var gpio_value = "echo 1 > /sys/class/gpio/gpio" + gpio_boot0 + "/value";
shellOut(gpio_value);
execSync('sleep 1');


// ---------------------- gpio RESET pin on off

var gpio_value = "echo 0 > /sys/class/gpio/gpio" + gpio_reset + "/value";
shellOut(gpio_value);
execSync('sleep 1');
var gpio_value = "echo 1 > /sys/class/gpio/gpio" + gpio_reset + "/value";
shellOut(gpio_value);
execSync('sleep 1');
var gpio_value = "echo 0 > /sys/class/gpio/gpio" + gpio_reset + "/value";
shellOut(gpio_value);
execSync('sleep 1');



// ---------------------- boot mode enter

function Loop() {
	setTimeout(function() {
		if ( protocol_status == 0 ) {
			// console.log("protocol_status--------------------: " + protocol_status);

			console.log("Request for enter boot mode");
			portS1.write( Buffer.from([0x7F]), function(err) {
				if (err) {
					console.log('err TX 0x7F');
				}
				console.log(Buffer.from([0x7F]));
			});
			execSync('sleep 1');

			Loop();		
		}
		else if ( protocol_status == 1 ) {
			console.log("Boot mode enable");

			// console.log("done--------------------: " + protocol_status);

			console.log("Request for flash erase");
			portS1.write( Buffer.from([0x43]), function(err) {
				if (err) {
					console.log('err TX 0x43');
				}
				console.log(Buffer.from([0x43]));
			});
			portS1.write( Buffer.from([0xBC]), function(err) {
				if (err) {
					console.log('err TX 0xBC');
				}
				console.log(Buffer.from([0xBC]));
			});

			execSync('sleep 1');

			Loop();
		}
		else if ( protocol_status == 2 ) {
			console.log("erasing flash");

			// console.log("done--------------------: " + protocol_status);

			console.log("Request for flash erase success");
			portS1.write( Buffer.from([0xFF]), function(err) {
				if (err) {
					console.log('err TX 0x7F');
				}
				console.log(Buffer.from([0xFF]));
			});
			portS1.write( Buffer.from([0x00]), function(err) {
				if (err) {
					console.log('err TX 0x7F');
				}
				console.log(Buffer.from([0x00]));
			});

			execSync('sleep 1');

			Loop();
		}
		else if ( protocol_status == 3 ) {
			console.log("flash erase success");

			console.log("done--------------------: " + protocol_status);

			console.log("uploading flash begging");

			// protocol_status = 0;
			// flasUpload();

			
			console.log("Request for begging flash upload");
			portS1.write( Buffer.from([0x31]), function(err) {
				if (err) {
					console.log('err TX 0x7F');
				}
				console.log(Buffer.from([0x31]));
			});
			portS1.write( Buffer.from([0xCE]), function(err) {
				if (err) {
					console.log('err TX 0x7F');
				}
				console.log(Buffer.from([0xCE]));
			});

			execSync('sleep 1');

			Loop();

			// console.log("exit boot mode");
			// var gpio_value = "echo 0 > /sys/class/gpio/gpio" + gpio_boot0 + "/value";
			// shellOut(gpio_value);
			// execSync('sleep 1');
			
			// var gpio_value = "echo 0 > /sys/class/gpio/gpio" + gpio_reset + "/value";
			// shellOut(gpio_value);
			// execSync('sleep 1');
			// var gpio_value = "echo 1 > /sys/class/gpio/gpio" + gpio_reset + "/value";
			// shellOut(gpio_value);
			// execSync('sleep 1');
		}
		else if ( protocol_status == 4 ) {
			console.log("upload address");

				portS1.flush();

				var value = Buffer.from([0x08]);
				writeAndDrain(value);
				// portS1.write( Buffer.from([0x08]), function(err) {
				// 	if (err) {
				// 		console.log('err TX 0x7F');
				// 	}
				// 	console.log(Buffer.from([0x00]));
				// });

				var value = Buffer.from([0x08]);
				writeAndDrain(value);
				// portS1.write( value, function(err) {
				// 	if (err) {
				// 		console.log('err TX 0x7F');
				// 	}
				// 	console.log(value);
				// });

				var value = Buffer.from([0x08]);
				writeAndDrain(value);
				// portS1.write( value, function(err) {
				// 	if (err) {
				// 		console.log('err TX 0x7F');
				// 	}
				// 	console.log(value);
				// });

				var value = Buffer.from([0x00]);
				writeAndDrain(value);
				// portS1.write( value, function(err) {
				// 	if (err) {
				// 		console.log('err TX 0x7F');
				// 	}
				// 	console.log(value);
				// });


				// var byte1 = 0xff & (address >> 24);
				// uart_send(byte1);
				// var byte2 = 0xff & (address >> 16);
				// uart_send(byte2);
				// var byte3 = 0xff & (address >> 8);
				// uart_send(byte3);
				// var byte4 = 0xff & address;
				// uart_send(byte4);
				// var value = Buffer.from([0x08]);

				var value = Buffer.from([0x08]);
				writeAndDrain(value);
				// portS1.write( value, function(err) {
				// 	if (err) {
				// 		console.log('err TX 0x7F');
				// 	}
				// 	console.log(value);
				// });
			


			execSync('sleep 1');


			Loop();

		}
		else if (protocol_status == 5) {

			console.log('address send success');

			console.log("exit boot mode");
			var gpio_value = "echo 0 > /sys/class/gpio/gpio" + gpio_boot0 + "/value";
			shellOut(gpio_value);
			execSync('sleep 1');

			var gpio_value = "echo 0 > /sys/class/gpio/gpio" + gpio_reset + "/value";
			shellOut(gpio_value);
			execSync('sleep 1');
			var gpio_value = "echo 1 > /sys/class/gpio/gpio" + gpio_reset + "/value";
			shellOut(gpio_value);
			execSync('sleep 1');

			// uart_send(0x04);

			// var value = Buffer.from([0x08,0x08,0x08,0x08,0x03]);
			// portS1.write( value, function(err) {
			// 	if (err) {
			// 		console.log('err TX 0x7F');
			// 	}
			// 	console.log(value);
			// });

			// uart_send(0x03);

			// execSync('sleep 1');

			// console.log('data send success');

			// Loop();


		}
		else {
			// -------------------------- gpio BOOT0 set low

			console.log("exit boot mode");
			var gpio_value = "echo 0 > /sys/class/gpio/gpio" + gpio_boot0 + "/value";
			shellOut(gpio_value);
			execSync('sleep 1');

			var gpio_value = "echo 0 > /sys/class/gpio/gpio" + gpio_reset + "/value";
			shellOut(gpio_value);
			execSync('sleep 1');
			var gpio_value = "echo 1 > /sys/class/gpio/gpio" + gpio_reset + "/value";
			shellOut(gpio_value);
			execSync('sleep 1');
		}

		
	},1000);
}
Loop();

var address = 0x08000000;

function writeAndDrain(data, callback) {
	portS1.write(data, function(err) {
		if (err) {
			console.log('err TX 0x7F');
		}
		console.log(Buffer.from([0x00]));
	});
	portS1.drain(callback);
}

function flasUpload() {

	if (protocol_status == 0) {
		console.log("Request for begging flash upload");
		var value = Buffer.from([0x31]);
		portS1.write( value, function(err) {
			if (err) {
				console.log('err TX 0x7F');
			}
			console.log(value);
		});
		var value = Buffer.from([0xCE]);
		portS1.write( value, function(err) {
			if (err) {
				console.log('err TX 0x7F');
			}
			console.log(value);
		});

		execSync('sleep 1');

		flasUpload();
	}	

	else if ( protocol_status == 1) {
		console.log("upload address");

		var byte1 = 0xff & (address >> 24);
		uart_send(byte1);
		var byte2 = 0xff & (address >> 16);
		uart_send(byte2);
		var byte3 = 0xff & (address >> 8);
		uart_send(byte3);
		var byte4 = 0xff & address;
		uart_send(byte4);
		var byte5 = byte1^byte2^byte3^byte4;
		uart_send(byte5);

		execSync('sleep 1');

		flasUpload();
	}
	else if ( protocol_status == 2) {
		console.log('address send success');
		uart_send(0x04);

		var value = Buffer.from([0x08,0x08,0x08,0x08,0x03]);
		portS1.write( value, function(err) {
			if (err) {
				console.log('err TX 0x7F');
			}
			console.log(value);
		});

		uart_send(0x03);

		execSync('sleep 1');

		flasUpload();
	}
	else if (protocol_status == 3) {
		console.log('send success');
		return;
	}
	console.log('return');
	return;
}

function uart_send(byte_value) {
	var value = Buffer.from([byte_value]);
	portS1.write( value, function(err) {
		if (err) {
			console.log('err uart_send');
		}
		console.log(value);
	});
}


portS1.on("open", function() {
	console.log("--Serial connection open--");
	portS1.on("data", function(data) {
		console.log("reading :");
		console.log(data);
		if (data.slice(0,1).toString('hex') == 79){
			protocol_status = protocol_status + 1;
			console.log("done protocol status " + protocol_status);
		}

	});
});



// var gpio_value = "echo 0 > /sys/class/gpio/gpio" + gpio_boot0 + "/value";
// shellOut(gpio_value);
// execSync('sleep 1');

// var gpio_set = "echo " + gpio_boot0 + " > /sys/class/gpio/unexport";
// shellOut(gpio_set);

// var gpio_set = "echo " + gpio_reset + " > /sys/class/gpio/unexport";
// shellOut(gpio_set);