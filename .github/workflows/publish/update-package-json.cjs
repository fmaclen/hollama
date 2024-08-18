// Usage:
// node .github/workflows/publish/update-package-json.js 4.2.0

const fs = require('fs');
const version = process.argv[2]; // Get version from command line argument

// Read package.json
fs.readFile('package.json', (err, data) => {
	if (err) throw err;

	let json = JSON.parse(data);

	// Update version field
	json.version = version;

	// Write updated package.json
	console.log('##### Updating version in `package.json`');
	fs.writeFile('package.json', JSON.stringify(json, null, 2), (err) => {
		if (err) throw err;
		console.log('##### `package.json` file has been updated. New version: ' + version);
	});
});
