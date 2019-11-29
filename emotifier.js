const fs = require('fs');

const argv = process.argv;
const mode = argv[2];
const input = argv[3];
const output = argv[4];
let emotifier;



const init = ()=>{
	if(argv.length !== 5){
		return showUsage();
	}
	emotifier = new Emotifier();
	switch(mode){
		case 'e':
			doEncode();
			break;

		case 'd':
			doDecode();
			break;

		default:
			return console.log(`Unrecognized mode, ${mode}.`);
			break;
	}
}


const doEncode = ()=>{
	fs.writeFileSync(output,emotifier.encode(fs.readFileSync(input)));
}

const doDecode = ()=>{
	fs.writeFileSync(output,emotifier.decode(fs.readFileSync(input).toString()));
}


const showUsage = ()=>{
	console.log('Invalid arguments.');
	console.log(`Usage: node emotifier.js [mode] [input file] [output file]`);
	console.log(`Example: node emotifier.js e example.txt example.txt.emotified`);
	console.log('Offered modes: [e: encode, d: decode]');
}


class Emotifier{
	constructor(){
		this.mouthLookup = [
			')','o','O','0','(','P','p','D',
			'\\','/','|','S','s','I','l','C'
		];
	}
	//Input buffer, output string
	encode(buffer){
		return [...buffer].map(currentByte=>{
			return this.emoteFromByte(currentByte);
		}).join('\n');

	}
	//Input string (of emotes), output buffer
	decode(emotes){
		return Buffer.from(emotes.split('\r').join('').split('\n').map(emote=>{
			return this.byteFromEmote(emote);
		}));
	}
	getBit(num,index){
		return (num & (1 << index-1))?1:0
	}
	byteFromEmote(emote){
		let currentByte = 0;
		emote = [...emote];
		if(emote.shift() === ':')
			currentByte = 1;
		switch(emote[0]){
			case ',':
				currentByte = currentByte | 0x2;
				emote.shift();
				break;
			case '`':
				currentByte = currentByte | 0x4;
				emote.shift();
				break;
			case '\'':
				currentByte = currentByte | 0x4 | 0x2;
				emote.shift();
				break;
		}
		if(emote[0] === '-'){
			currentByte = currentByte | 0x8;
			emote.shift();
		}
		currentByte = currentByte | (this.mouthLookup.indexOf(emote[0]) << 4);
		return currentByte;

	}
	emoteFromByte(currentByte){
		let str = '';
		if(this.getBit(currentByte,1)){
			str += ':';
		} else {
			str += ';';
		}
		let num = this.getBit(currentByte,2)  + (this.getBit(currentByte,3) << 1);
		switch(num){
			case 0:
				str += '';
				break;
			case 1:
				str += ',';
				break;
			case 2:
				str += '`';
				break;
			case 3:
				str += '\'';
				break;
		}
		if(this.getBit(currentByte,4))
			str += '-';
		else
			str += '';
		num = currentByte >> 4;
		str += this.mouthLookup[num];
		return str;
	}
}


init()
