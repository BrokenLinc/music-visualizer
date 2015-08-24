var Player = require('player');
var MIDIEvents = require('midievents');
var MIDIFile = require('midifile');
var fs = require('fs');
var ctx = require('axel');
var argv = require('yargs').argv;

//song library
var songs = {
	'uptown_funk': {
		mp3: '01-04- Uptown Funk.mp3',
		midi: 'mark_ronson-uptown_funk_ft_bruno_mars.mid',
		mp3_mid_offset: -190,
		mp3_mid_multiplier: 1
	},
	'get_lucky': {
		mp3: '01-08- Get Lucky.mp3',
		midi: 'daft_punk-get_lucky_feat_pharrell_williams.mid',
		mp3_mid_offset: 1200,
		mp3_mid_multiplier: 1
	}
}

//song selection
var song = songs['uptown_funk'];



var mp3_filepath = './media/'+song.mp3;
var mid_filepath = './media/'+song.midi;
var mp3_mid_offset = song.mp3_mid_offset; //negative delays the midi
var mp3_mid_multiplier = song.mp3_mid_multiplier; //higher makes midi run faster

var player = new Player(mp3_filepath);


// // Your variable with an ArrayBuffer instance containing your MIDI events
// var anyBuffer;

// // MIDI events parser
// var event, events=[], parser;
// parser=new MIDIEvents.createParser(
//   new DataView(anyBuffer),
//     0, false);
// event=parser.next();
// do {
//   events.push(event);
//   event=parser.next();
// } while(event);

// // Check bufffer size before encoding
// if(anyBuffer.length >= MIDIEvents.getRequiredBufferLength(events)) {
//   console.log('ok');
// }

// // Encode MIDI events
// var destination = new Uint8Array(anyBuffer);
// MIDIEvents.writeToTrack(events, destination);


// Read the log file into memory
fs.readFile(mid_filepath, function (err, logData)
{
    // If an error occurs, throw it and exit the application.
    if (err)
    {
        throw err;
    }
    // Convert the byte array buffer to a string.
    //var text = logData.toString();

    process_array_buffer(toArrayBuffer(logData));
});

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

function toBuffer(ab) {
    var buffer = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
}


function process_array_buffer(anyBuffer) {
	var midiFile = new MIDIFile(anyBuffer);
	var events = midiFile.getMidiEvents();

	if(argv.debug) {
		analyzeit(events);
	} else {
		playit(player, events);
	}
}

function analyzeit(events) {
	var r = {};
	for(var i=0; i<events.length; i++) {
		if(events[i].subtype == 9) {
			var c = r[events[i].param1] || 0;
			c++;
			r[events[i].param1] = c;
		}
	}
	for(var i in r) {
		console.log(i + ' : ' + r[i]);
	}
}

function playit(player, events) {
	player.play();
	
	var event_index = 0;
	var start_time = now();

	ctx.bg(0,0,0);
	ctx.clear();

	function advance() {
		var elapsed_time = now() - start_time;
		var adjusted_time = (elapsed_time) * mp3_mid_multiplier + mp3_mid_offset;

		if(events[event_index].playTime < adjusted_time) {
			//ctx.bg(0,0,0);
			//ctx.clear();
			//ctx.bg(0,255,212);
		}

		while(event_index < events.length && events[event_index] && events[event_index].playTime < adjusted_time) {
			//console.log(events[event_index].playTime);

			switch(events[event_index].subtype) {
				case 8:
					//off
					ctx.bg(0,0,0);
					break;
				case 9:
					//on
					//ctx.bg(0,255,212);
					setRGB(events[event_index].param1, events[event_index].param2);
					break;
				case 11:
					//start?
					ctx.bg(0,0,0);
					break;
				default:
					ctx.bg(0,0,00);
			}

			function setRGB(p1, p2) {
				var a;
				if(p1<9) {
					a = [1,0,0];
				} else if(p1<17) {
					a = [1,1,0];
				} else if(p1<25) {
					a = [0,1,0];
				} else if(p1<33) {
					a = [0,1,1];
				} else if(p1<41) {
					a = [0,0,1];
				} else if(p1<49) {
					a = [1,0,1];
				} else if(p1<57) {
					a = [1,0,0];
				} else if(p1<65) {
					a = [1,1,0];
				} else if(p1<73) {
					a = [0,1,0];
				} else if(p1<81) {
					a = [0,1,1];
				} else if(p1<89) {
					a = [0,0,1];
				} else {
					a = [1,1,1];
				}

				var r = 255;

				ctx.bg(a[0]*r, a[1]*r, a[2]*r);
			}
			
			// console.log([
			// 	events[event_index].playTime,
			// 	events[event_index].subtype,
			// 	events[event_index].param1,
			// 	events[event_index].param2
			// ].join(' : '));
			
			ctx.line(
				events[event_index].param1, 10,
				events[event_index].param1, 20
				);
			event_index++;
		}

		setTimeout(advance, 1);
	}

	advance();
}

function now() {
	return new Date().getTime();
}


// function process_array_buffer(anyBuffer) {
// 	var midiFile = new MIDIFile(anyBuffer);
// 	var events = midiFile.getMidiEvents();
// 	console.log(events.length);
// 	for(var i=0; i<100; i+=1) {
// 		console.log([
// 			events[i].playTime,
// 			events[i].subtype,
// 			events[i].param1,
// 			events[i].param2
// 		].join(' : '));
// 	}
// }


// Your variable with a ArrayBuffer instance containing your MIDI file
// var anyBuffer;

// // Creating the MIDIFile instance
// var midiFile= new MIDIFile(anyBuffer);

// // Reading headers
// midiFile.header.getFormat(); // 0, 1 or 2
// midiFile.header.getTracksCount(); // n
// // Time division
// if(midiFile.header.getTimeDivision()===MIDIFileHeader.TICKS_PER_BEAT) {
//     midiFile.header.getTicksPerBit();
// } else {
//     midiFile.header.getSMPTEFrames();
//     midiFile.header.getTicksPerFrame();
// }

// // MIDI events retriever
// var events=midiFile.getMidiEvents();
// events[0].subtype; // type of [MIDI event](https://github.com/nfroidure/MIDIFile/blob/master/src/MIDIFile.js#L34)
// events[0].playTime; // time in ms at wich the event must be played
// events[0].param1; // first parameter
// events[0].param2; // second one

// // Lyrics retriever
// var lyrics=midiFile.getLyrics();
// lyrics[0].playTime; // Time at wich the text must be displayed
// lyrics[0].text; // The text content to be displayed

// // Reading whole track events and filtering them yourself
// var trackEventsChunk=midiFile.getTrackEvents(0),
//     events=new MIDIFile.createParser(trackEventsChunk),
//     event;
// while(event=events.next()) {
//     // Printing meta events containing text only
//     if(event.type===MIDIFile.EVENT_META&&event.text) {
//         console.log('Text meta: '+event.text);
//     }
// }