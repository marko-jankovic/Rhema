const fs = require('fs');
const path = require('path');

module.exports = (fullPath) => {
    try {
        // find it in rhema dir
        return fs.readFileSync(path.resolve(__dirname, '../', fullPath), 'utf8');
    } catch (e) {
        // it is in app dir
        return fs.readFileSync(path.resolve(process.cwd(), fullPath), 'utf8');
    }
};
