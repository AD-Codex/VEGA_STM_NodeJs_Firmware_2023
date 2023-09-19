
var gpio_boot0 = 13;
var gpio_reset = 12;

var protocol_status = 0;
var packet_data_size = 127;

const {exec} = require("child_process");
const {SerialPort} = require('serialport');
const {execSync} = require('child_process');

const fs = require('fs');


const portS1 = new SerialPort({ path: '/dev/ttyS1', baudRate: 9600});

portS1.on("open", function() {
	console.log("--Serial connection open--");
	portS1.on("data", function(data) {
		console.log("reading :");
		console.log(data);
		if (data.slice(0,1).toString('hex') == 79){
			protocol_status = 1;
			console.log("done protocol status " + protocol_status);
		}
	});
});

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

async function stm32_flash() {

	// gpio set
	var gpio_set = "echo " + gpio_boot0 + " > /sys/class/gpio/unexport";
	shellOut(gpio_set);
	await delay(1000);
	var gpio_set = "echo " + gpio_boot0 + " > /sys/class/gpio/export";
	shellOut(gpio_set);
	await delay(1000);

	var gpio_direc = "echo out > /sys/class/gpio/gpio" + gpio_boot0 + "/direction";
	shellOut(gpio_direc);
	await delay(1000);


	var gpio_set = "echo " + gpio_reset + " > /sys/class/gpio/unexport";
	shellOut(gpio_set);
	await delay(1000);
	var gpio_set = "echo " + gpio_reset + " > /sys/class/gpio/export";
	shellOut(gpio_set);
	await delay(1000);

	var gpio_direc = "echo out > /sys/class/gpio/gpio" + gpio_reset + "/direction";
	shellOut(gpio_direc);
	await delay(1000);

	// ------------------------ gpio BOOT0 set high

	var gpio_value = "echo 1 > /sys/class/gpio/gpio" + gpio_boot0 + "/value";
	shellOut(gpio_value);
	await delay(1000);


	// ---------------------- gpio RESET pin on off

	var gpio_value = "echo 0 > /sys/class/gpio/gpio" + gpio_reset + "/value";
	shellOut(gpio_value);
	await delay(500);
	var gpio_value = "echo 1 > /sys/class/gpio/gpio" + gpio_reset + "/value";
	shellOut(gpio_value);
	await delay(500);
	var gpio_value = "echo 0 > /sys/class/gpio/gpio" + gpio_reset + "/value";
	shellOut(gpio_value);
	await delay(500);


	boot();

}

async function boot(){
	protocol_status = 0;

	while(1) {
		console.log("Request for enter boot mode");

		uart_send(0x7F);
		await delay(1000);

		if ( protocol_status == 1){
			protocol_status = 0;
			break;
		}
	}

	while(1){
		console.log("Boot mode enable");

		// console.log("done--------------------: " + protocol_status);

		console.log("Request for flash erase");
		uart_send(0x43);
		await delay(100);
		uart_send(0xBC);
		await delay(100);

		await delay(1000);

		if ( protocol_status == 1){
			protocol_status = 0;
			break;
		}
	}

	while(1){
		console.log("erasing flash");

		// console.log("done--------------------: " + protocol_status);

		console.log("Request for flash erase success");
		var value = Buffer.from([0xFF]);
		portS1.write( value, function(err) {
			if (err) {
				console.log('err TX 0x7F');
			}
			console.log(value);
		});
		await delay(500);
		var value = Buffer.from([0x00]);
		portS1.write( value, function(err) {
			if (err) {
				console.log('err TX 0x7F');
			}
			console.log(value);
		});

		await delay(1000);
		if ( protocol_status == 1){
			protocol_status = 0;
			break;
		}
	}

	while(1){
		console.log("Request for begging flash upload");
		var value = Buffer.from([0x31]);
		portS1.write( value, function(err) {
			if (err) {
				console.log('err TX 0x7F');
			}
			console.log(value);
		});
		await delay(500);
		var value = Buffer.from([0xCE]);
		portS1.write( value, function(err) {
			if (err) {
				console.log('err TX 0x7F');
			}
			console.log(value);
		});
		await delay(1000);

		if ( protocol_status == 1){
			console.log("uploading flash begging");
			protocol_status = 0;
			break;
		}
	}

	
	while(1){
		console.log("upload address");

		portS1.write( Buffer.from([0x08]), function(err) {
			if (err) {
				console.log('err TX 0x7F');
			}
			console.log(Buffer.from([0x08]));
		});
		await delay(500);
		portS1.write( Buffer.from([0x00]), function(err) {
			if (err) {
				console.log('err TX 0x7F');
			}
			console.log(Buffer.from([0x00]));
		});
		await delay(500);
		portS1.write( Buffer.from([0x00]), function(err) {
			if (err) {
				console.log('err TX 0x7F');
			}
			console.log(Buffer.from([0x00]));
		});
		await delay(500);
		portS1.write( Buffer.from([0x00]), function(err) {
			if (err) {
				console.log('err TX 0x7F');
			}
			console.log(Buffer.from([0x00]));
		});
		await delay(500);

		portS1.write( Buffer.from([0x08]), function(err) {
			if (err) {
				console.log('err TX 0x7F');
			}
			console.log(Buffer.from([0x00]));
		});
		await delay(1000);

		if ( protocol_status == 1){
			console.log('address send success');
			protocol_status = 0;
			break;
		}

	}


	while(1) {
		console.log("send data");

			portS1.write( Buffer.from([0x03]), function(err) {
				if (err) {
					console.log('err TX 0x7F');
				}
				console.log(Buffer.from([0x03]));
			});
			await delay(10);

			portS1.write( Buffer.from([0x10]), function(err) {
				if (err) {
					console.log('err TX 0x7F');
				}
				console.log(Buffer.from([0x10]));
			});
			await delay(10);
			portS1.write( Buffer.from([0x11]), function(err) {
				if (err) {
					console.log('err TX 0x7F');
				}
				console.log(Buffer.from([0x10]));
			});
			await delay(10);
			portS1.write( Buffer.from([0x01]), function(err) {
				if (err) {
					console.log('err TX 0x7F');
				}
				console.log(Buffer.from([0x01]));
			});
			await delay(10);
			portS1.write( Buffer.from([0x01]), function(err) {
				if (err) {
					console.log('err TX 0x7F');
				}
				console.log(Buffer.from([0x01]));
			});
			await delay(10);

			portS1.write( Buffer.from([0x02]), function(err) {
				if (err) {
					console.log('err TX 0x7F');
				}
				console.log(Buffer.from([0x02]));
			});

			await delay(1000);

			if (protocol_status == 1) {
				console.log("write done");
				break;
			}
	}


	console.log("exit boot mode");
	var gpio_value = "echo 0 > /sys/class/gpio/gpio" + gpio_boot0 + "/value";
	shellOut(gpio_value);
	await delay(1000);
	
			
	var gpio_value = "echo 0 > /sys/class/gpio/gpio" + gpio_reset + "/value";
	shellOut(gpio_value);
	await delay(1000);
	var gpio_value = "echo 1 > /sys/class/gpio/gpio" + gpio_reset + "/value";
	shellOut(gpio_value);
	await delay(1000);

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



stm32_flash();