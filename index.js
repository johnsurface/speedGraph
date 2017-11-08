const speedTest = require('speedtest-net');
const moment = require('moment');
const chart = require('canvas-chart');
const ChartjsNode = require('chartjs-node');

const limit = 50;

var count = 0;

var _timestamps = [];
var _chartData = [];

// var _timestamps = ['5:10:15', '5:10:44', '5:11:11', '5:11:52', '5:12:20'];
// var _chartData = [4.455, 6.575, 8.805, 6.749, 4.991];

// function drawChartImage() {
// 	console.dir(_chartData)
// 	chart.graph(_chartData, {
// 		filename : 'testChart',
// 		height   : 600,
// 		width    : 600,
// 		fillColor: 'rgba(12, 165, 176, 1)',
// 		points   : true,
// 		//grid     : true
// 	});
// }

function drawChartImage() {
	console.dir(_chartData);
	var chartNode = new ChartjsNode(1200, 600);
	var chartJsOptions = {
		type : 'line',
		// data : _chartData,
		data    : {
			datasets : [{
				data : _chartData,
				label : 'Download Speeds (MB/s)',
				borderColor : '#42f4e2',
				lineTension : 0
			}],
			labels : _timestamps
		},
		options : {
			scales : {
				xAxes : [{
					type : 'time',
					time : {
						displayFormats : {
							second : 'h:mm:ss'
						}
					}
				}]
			}
		}
	};
	// return 
	chartNode.drawChart(chartJsOptions)
	.then(() => {
	    // chart is created
	 
	    // get image as png buffer
	    return chartNode.getImageBuffer('image/png');
	})
	.then(buffer => {
	    Array.isArray(buffer) // => true
	    // as a stream
	    return chartNode.getImageStream('image/png');
	})
	.then(streamResult => {
	    // using the length property you can do things like
	    // directly upload the image to s3 by using the
	    // stream and length properties
	    streamResult.stream // => Stream object
	    streamResult.length // => Integer length of stream
	    // write to a file
	    return chartNode.writeImageToFile('image/png', './testimage.png');
	})
	.then(() => {
	    // chart is now written to the file path
	    // ./testimage.png
	    console.log('wrote chart?')
	});
}

function runTest() {
	count++;
	let test = speedTest({maxTime: 5000});

	test.on('data', data => {
	  // console.dir(data);
	  if (data && data.speeds) {
	  	_chartData.push(data.speeds.download);
	  	let now = moment();
	  	// _timestamps.push(now.format('h:mm:ss'));
	  	_timestamps.push(new Date());
	  	console.log(now.format('h:mm:ss') + ' - ' + data.speeds.download + ' MB/s');
	  }

	  if (count < limit) {
	  	runTest();
	  } else {
	  	drawChartImage();
	  }
	});
	 
	test.on('error', err => {
	  console.error(err);
	});
}

// while (count < limit) {
// 	runTest();
// }

runTest();
// drawChartImage();