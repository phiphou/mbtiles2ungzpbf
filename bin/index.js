#!/usr/bin/env node

const Buffer = require('buffer').Buffer
const zlib = require('zlib')
const fs = require('fs')
const sqlite3 = require('sqlite3')
const writeFile = require('writefile')

let argv = require('yargs')
  .usage('Usage: <command> [options]')
  .command('mbtiles2ungzpbf', 'Convert an mbtiles file into a set of ungzipped pbf tiles.')
  .example('mbtiles2ungzpbf -f tiles.mbtiles', 'the mbtiles file.')
  .option('file', {
    alias: 'f',
    demandOption: true,
    describe: 'The mbtiles file.',
    type: 'string'
  })
  .check(check_args)
  .showHelpOnFail(false, 'Specify --help or -h for usage instructions')
  .help('h')
  .alias('h', 'help')
  .epilog(`copyright © Phiphou ${new Date().getFullYear()}`)
  .argv;

function check_args(args, options) {
  if (!fs.existsSync(args.file))
    throw `${args.file} could not be found, please check it's path.`
  return true
}

let db = new sqlite3.Database(argv.file, function (err) {});

db.each("SELECT * FROM tiles", function (err, row) {
  if (err) {
    console.error(`Error while reading ${argv.file}, please check it's a valid mbtile file.\r\nError was : ${err}`)
  } else {
    let raw = zlib.gunzipSync(new Buffer(row.tile_data))
    let y = (1 << row.zoom_level) - row.tile_row - 1
    writeFile(`tiles/${row.zoom_level}/${row.tile_column}/${y}.pbf`, raw)
  }
})
