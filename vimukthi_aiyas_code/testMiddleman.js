const middleman = require('./middleman1.1');

/*check for read data*/
function L2fucntion(){
	console.log(middleman.readMCUData('Mode1'));
	console.log(middleman.newTap.getTapString());
	
}
//let middlemanID = setInterval(()=>L2fucntion(),1000);



/*check for page change*/
middleman.pageChange(73);

/*write msg*/
//console.log(middleman.writeMCUData('AUTH'))






