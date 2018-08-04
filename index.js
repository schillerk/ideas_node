const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/api/ideas', (req, res) => {
	console.log('hitting ideas endpoint');
	const db = new sqlite3.Database('./data.db', (err) => {
		if (err) {
			console.log(err.message);
		}
		console.log('connected to database');
	});

	let sql = `SELECT * FROM ideas`;

	db.all(sql, [], (err, rows) => {
	  if (err) {
	    throw err;
	  }
	  const out = []
	  rows.forEach((row) => {
	    out.push(row.blob);
	  });
	  res.json(out);
	});

	db.close((err) => {
	  if (err) {
	    console.error(err.message);
	  }
	  console.log('Close the database connection.');
	});
});

app.get('/api/submit/:idea', (req, res) => {
	console.log('hitting the submit endpoint');
	const db = new sqlite3.Database('./data.db', (err) => {
		if (err) {
			console.log(err.message);
		}
		console.log('connected to database');
	});

	const newIdea = JSON.stringify(req.params.idea)
	// console.log(req.params.idea);
	// console.log(JSON.stringify(req.params.idea));
	console.log(newIdea);
	let sql = `INSERT INTO ideas VALUES(?)`;
	db.run(sql, [newIdea], (err, rows) => {
	  if (err) {
	    throw err;
	  }
	  console.log('successful insertion');
	});

	db.close((err) => {
	  if (err) {
	    console.error(err.message);
	  }
	  console.log('Close the database connection.');
	});
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);
