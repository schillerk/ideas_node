const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const path = require('path');

const app = express();

// Code to initialize and populate database
// var db = new sqlite3.Database('./database.db');
// db.serialize(function() {
	// db.run("CREATE TABLE tags (label TEXT)");
// 	const query = `INSERT INTO tags VALUES(?)`;
// 	db.run(query, 'UX');
// 	db.run(query, 'Data Viz');
// 	db.run(query, 'Moonshots');
// 	db.each(`SELECT rowid as id, label FROM tags`, function(err, row) {
// 		console.log(row.id, row.label);
// 	});
// 	db.close();
// });

const splitString = '__,__';
function parseArr(arr) {
	return arr.reduce((acc, el) =>
		acc += el + splitString, '').slice(0, -splitString.length);
}

app.get('/api/fetchAllTags', (req, res) => {
	var db = new sqlite3.Database('./database.db');

	const query = 'SELECT rowid, * FROM tags';
	db.all(query, [], (err, rows) => {
	  if (err) { throw err }
	  const out = rows.map((row) => {
	    return {
	    	rowid: row.rowid,
	    	label: row.label,
	    };
	  });
	  res.json(out);
	  console.log('Select Success');
	});

	db.close();
});


app.get('/api/fetchAllIdeas', (req, res) => {
	var db = new sqlite3.Database('./database.db');

	const query = 'SELECT rowid, * FROM ideas';
	db.all(query, [], (err, rows) => {
	  if (err) { throw err }
	  const out = rows.map((row) => {
	    return {
	    	rowid: row.rowid,
	    	label: row.label,
	    	tags: row.tags,
	    };
	  });
	  res.json(out);
	  console.log('Select Success');
	});

	db.close();
});

app.get('/api/insert/:idea', (req, res) => {
	const db = new sqlite3.Database('./database.db');
	console.log('trying to insert');

	const dataObj = JSON.parse(req.params.idea);
	console.log(dataObj);
	console.log(parseArr(dataObj.tags));
	const data = [dataObj.label, parseArr(dataObj.tags)];
	const query = `INSERT INTO ideas VALUES(?, ?)`;

	db.run(query, data, function(err, rows) {
	  if (err) { throw err }
	  res.json(this.lastID);
	  console.log('Insert Success');
	});

	db.close();
});

app.get('/api/delete/tag/:rowid', (req, res) => {
	var db = new sqlite3.Database('./database.db');

	const data = JSON.parse(req.params.rowid);
	const query = `DELETE FROM tags WHERE rowid = ?`;

	db.run(query, data, (err, rows) => {
	  if (err) { throw err }
	  console.log('Delete Success');
	});

	db.close();
});


app.get('/api/delete/idea/:rowid', (req, res) => {
	var db = new sqlite3.Database('./database.db');

	const data = JSON.parse(req.params.rowid);
	const query = `DELETE FROM ideas WHERE rowid = ?`;

	db.run(query, data, (err, rows) => {
	  if (err) { throw err }
	  console.log('Delete Success');
	});

	db.close();
});

app.get('/api/update/:obj', (req, res) => {
	const db = new sqlite3.Database('./database.db');

	const dataObj = JSON.parse(req.params.obj);
	console.log(dataObj);
	const data = [dataObj.label, dataObj.rowid];
	const query = `UPDATE ideas
	            	SET label = ?
	            	WHERE rowid = ?`;

	db.run(query, data, (err) => {
	  if (err) { throw err }
	  console.log('Update Success');
	});

	db.close();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);
