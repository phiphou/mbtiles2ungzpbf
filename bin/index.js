#!/usr/bin/env node
var Buffer = require('buffer').Buffer
var zlib = require('zlib')
var sqlite3 = require('sqlite3')
var writeFile = require('writefile')

var argv = require('yargs')
    .usage('Usage: <command> [options]')
    .example('mbtiles2ungzpbf -f tiles.mbtiles', 'the mbtiles file.')
    .alias('f', 'file')
    .describe('f', 'the mbtiles file.')
    .demandOption(['f'])
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2017')
    .argv;

var db = new sqlite3.Database(argv.file, function (err) {});

db.each("SELECT * FROM tiles", function (err, row) {
  var raw = zlib.gunzipSync(new Buffer(row.tile_data))
  var y = (1 << row.zoom_level) - row.tile_row - 1
  writeFile(`tiles/${row.zoom_level}/${row.tile_column}/${y}.pbf`, raw)
})
