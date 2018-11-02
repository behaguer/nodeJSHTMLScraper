var cheerio = require('cheerio');
var request = require('request');
var path = require('path');
var fs = require('fs');
var cleaner = require('clean-html');

var filelist = [];
var csvdatarow = [];

// Clear file
try {
    fs.unlinkSync('output/products.csv');
} catch (err) {
    console.error(err);
}

// Write Headers set this up to be the headings for the CSV
writetocsv("Filename,Category,Heading,Description,Mainimage\n");

// Get file names to scrape from
function fromDir(startPath,filter,callback){

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);

    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,filter,callback); //recurse
        }
        else if (filter.test(filename)) callback(filename);
    }
}

// Get all the html files list
fromDir('./scrape',/\.html$/,function(filename){
    filelist.push('./'+filename);
});

// Process the file
function processFile( data, category, filename) {

    console.log(category);

    csvdatarow = [];

    $ = cheerio.load(data, { 
        normalizeWhitespace: true,
        xmlMode: true 
    });

    // Scraping 
    $('h2').each(function() {
        csvdatarow.push( $(this).text() );
    });

    // Get Description
    $('.col-md-10').each(function() {
        description = $(this).html();
        description = description.replace(/\"/g,'\'');
        csvdatarow.push( "\""+description+"\"");
    });

    //get the main image
    csvdatarow.push($('.col-md-10').find('img').attr('src'));

    writetocsv(csvdatarow);

}

function writetocsv(csvdata) {
        // write csv
        try {
            fs.appendFileSync('output/products.csv', csvdata);
        } catch (err) {
            console.error(err);
        }
}

var fs = require('fs'),
files = fs.readdirSync(__dirname + '/scrape/');

filelist.forEach(function(file) {

    var contents = fs.readFileSync(file, 'utf8');
    var regex = /\\(.*\\)/g;
    var category = file.match(regex);

    category = category.toString();    
    category = category.replace(/\\/g, '');

    writetocsv("\n"+file+","+category+","); // new line start with category
    processFile(contents, category); // get other data


})
