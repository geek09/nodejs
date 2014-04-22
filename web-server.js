var express = require('express'),
	fs = require('fs'),
	port = 8000,

	inputDataTable;

fs.readFile('address2.json', { encoding: 'utf8'}, function (error, data) {
	inputDataTable = JSON.parse(data);
	startApp();
});

function startApp() {
	var app = express();

	app.use (express.bodyParser());
	app.use (express.static(__dirname + '/www'));

	app.get('/rest/addresses', function (req, res) {
		res.send(inputDataTable);
	});

	app.put('/rest/addresses/:id', function (req, res) {
		var id = req.params.id,
			bodyData = req.body;
		for (var i = 0; i < inputDataTable.length; i++) {
			if (id == inputDataTable[i].id){
				inputDataTable[i] = bodyData;
			}
		}
		res.send(bodyData);
	});

	app.post('/rest/addresses/:id', function (req, res) {
		var id = req.params.id,
			bodyData = req.body;

		if (id == -1){
			bodyData.id = inputDataTable.length + 1;
			inputDataTable.push(bodyData);
		}

		res.send(bodyData);
	});

	app.del('/rest/addresses/:id', function (req, res) {
		var id = req.params.id;
		for (var i = 0; i < inputDataTable.length; i++) {
			if (id == inputDataTable[i].id){
				inputDataTable.splice(i, 1);
			}
		}
		res.send('Success');
	});

	app.listen(port, function () {
		console.log('Web server has started.........');
	});
}

