var shell = require('shelljs');
shell.exec('node clearTestDb.js');
console.log('after clear TestDb');

shell.exec('set NODE_ENV=test&node initTestData.js');
console.log('after init TestDb');
setTimeout(beginTest, 3000);

function beginTest() {

    shell.exec('set NODE_ENV=test& mocha test/test.js  ');
}