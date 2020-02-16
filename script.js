//-------------------------------------------------------------
// Import Modules
// www.cloakedsec.com tm
//-------------------------------------------------------------
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
const fs = require('fs');
const {
    Document,
    Paragraph,
    Packer
} = require('docx');
const path = require('path');

//-------------------------------------------------------------
// Varriable Declarations
//-------------------------------------------------------------
let tempArr = [];
let newTempArr = [];
let filelist = [];
let dirPath = process.argv[2] + '/';

//-------------------------------------------------------------
// API Credentials
//-------------------------------------------------------------
const speechToText = new SpeechToTextV1({
    // username: "2fb12812-b34a-401f-a005-4d2ab2f72e6d",
    // password: "qbSut3LD8kb0"
	iam_apikey:'14YBI9EowC0YPykzh1mDftO1SUgenTrpu6D0GVfSCpxT',
	url:'https://gateway-lon.watsonplatform.net/speech-to-text/api'
});

//-------------------------------------------------------------
// Read Directory
//-------------------------------------------------------------
(readDir = (dir) => {
    let files = fs.readdirSync(dir);
    files.forEach(function (file) {
        if (fs.statSync(dir + '/' + file).isDirectory()) {
            readDir(dir + file + '/');
        } else {
            filelist.push(dir + file);

        }
    });
})(dirPath);

//-------------------------------------------------------------
// Conversion Process
//-------------------------------------------------------------
filelist.forEach(function (file, index) {
    if (path.parse(file).ext != ".mp3" || filelist.length == 0) {
        console.log(`No Mp3 file available in the folder.`);
    } else {
        let params = {
            audio: fs.createReadStream(file),
            content_type: 'audio/mp3',
            timestamps: true
        };
        speechToText.recognize(params, function (error, transcript) {
            console.log(`Processing......`);
            if (error) {
                console.log('Error:', error);
            } else {
                let tempInput = [];
                let results = transcript.results;
                for (let i = 0; i < results.length; i++) {
                    tempArr = []
                    tempArr.push(results[i].alternatives[0].transcript);
                    tempArr.push(results[i].alternatives[0].timestamps[0][1]);
                    tempArr.push(results[i].alternatives[0].timestamps[results[i].alternatives[0].timestamps.length - 1][2]);
                    tempInput.push(tempArr);
                }
                newTempArr = [];
                for (let j = 0; j < tempInput.length; j++) {
                    newTempArr.push(tempInput[j][0]);
                }
                //-------------------------------------------------------------
                // Writing Output into Doc
                //-------------------------------------------------------------
                const doc = new Document();
                const paragraph = new Paragraph(newTempArr.join(' '));
                doc.addParagraph(paragraph);
                const packer = new Packer();
                packer.toBuffer(doc).then((buffer) => {
                    fs.writeFileSync(path.parse(file).dir + '/' + path.parse(file).name + ".docx", buffer);
                    if (filelist.length == (index + 1)) {
                        console.log(`Proceess completed successfully`);
                    }
                });
            }
        });
    }
}); 