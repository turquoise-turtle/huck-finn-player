// check the url and get rid of the part after the hash
var string = location.href,
    substring = '#';
if (string.indexOf(substring) !== -1) {
	console.log('true');
	var splitwords = string.split('#');
	var word = splitwords[0];
	//console.log(word);
	location.href = word;
} else {
	console.log(string.indexOf(substring));
}


// stuff about object URLs, files, dropbox learned from:
// https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications

// making the swf player:
// https://github.com/swfobject/swfobject/

var dropbox;

dropbox = document.getElementById("dropbox");
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);
dropbox.addEventListener("dragleave", dragleave, false);

function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
  dropbox.classList.add('animated');
}

function dragleave(e) {
	e.stopPropagation();
	e.preventDefault();
	dropbox.classList.remove('animated');
}

function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  var dt = e.dataTransfer;
  var files = dt.files;

  handleFiles(files);
}

function makeswf(swfurl, id) {
	var flashvars = {};
	var params = {};
	var attributes = {};	
	params.bgcolor="#FFFFFF";
	params.quality="best";
	params.scale="showall";
	params.allowfullscreen="true";
	params.fullscreenonselection="true";
	
	attributes.name = "";
	attributes.styleclass = "";
	attributes.align = "";
	
	if(window.chrome) {
		swfobject.ua.pv = [100, 0, 0];  //https://github.com/swfobject/swfobject/issues/57#issuecomment-287619930
	}
	
	swfobject.switchOffAutoHideShow(); //https://github.com/swfobject/swfobject/wiki/SWFObject-2.2:-What's-New%3F#10-the-option-to-switch-off-swfobjects-default-showhide-behavior
	
	
	//swfobject.embedSWF(swfurl, "flashContent", "100%", "100%", "14.0.0", false, flashvars, params, attributes);
	swfobject.embedSWF(swfurl, id, "100%", "100%", "14.0.0", false, flashvars, params, attributes);
	location.href = location.href + '#' + id;
	console.log('did it work?');
}

var counter = 0;

function handleFiles(param) { 
	var fileblob = param[0];
	
	var objectURL = window.URL.createObjectURL(fileblob);
	
	
	
	JSZipUtils.getBinaryContent(objectURL, function(err, data) {
		if(err) {
			throw err; // or handle err
		}
		
		var zip = new JSZip();
		zip.loadAsync(data).then(function(contents){
			//https://stackoverflow.com/questions/39322964/extracting-zipped-files-using-jszip-in-javascript/39964957#39964957
			//Object.keys(contents.files).forEach(function (filename){
			for (var filename of Object.keys(contents.files)){
				
				var mac = /__MACOSX/;
				var swftype = /.swf$/i;
				var macc = filename.match(mac);
				console.log('macc:', macc);
				var swftypec = filename.match(swftype);
				console.log('swftypec:', swftypec);
				
				
				
				if (macc == null && swftypec != null) {
					console.log('I think this is it boys.');
					//zip.files[filename].async('uint8array').then(function(u8) {
					zip.files[filename].async('blob').then(function(u8) {
						var u8url = window.URL.createObjectURL(u8);
						console.log('u8:', u8);
						console.log('u8url:', u8url);
						if (counter == 0) {
							makeswf(u8url, 'flashContent' + counter.toString());
							counter = counter + 1;
						} else {
							var x = document.createElement('div');
							x.id = 'flashContent' + counter.toString();
							document.body.appendChild(x);
							//makeswf(u8url, x.id);
							counter = counter + 1;
						}
						
					});
					//break
				} else {
					console.log(filename, 'was either mac and swf, mac or something else apparently');
				}
			}
		}).catch(function(error) {
			console.log('error:', error);
			console.log('was this an actual swf?');
			if (counter == 0) {
				makeswf(objectURL, 'flashContent' + counter.toString());
				counter = counter + 1;
			} else {
				var x = document.createElement('div');
				x.id = 'flashContent' + counter.toString();
				document.body.appendChild(x);
				makeswf(objectURL, x.id);
				counter = counter + 1;
			}
		});
	});
		
		
	//console.log(objectURL, 'Did the URL work?');
	
	//var player = document.createElement('div');
	//player.id = 'flashContent';
	//document.body.appendChild(player);
	
	//var header = document.getElementsByTagName('article')[0];
	//header.style = 'display: none; background-color: #FFF;';
	
	//var setup = document.getElementsByTagName('article')[0];
	//setup.parentNode.removeChild(setup);
	
	dropbox.classList.remove('animated');
	
	//https://stackoverflow.com/questions/13555785/remove-all-child-from-node-with-the-same-class-pure-js/13555954#13555954
	var elements = document.getElementsByClassName("deleteme");
	while (elements[0]) {
		elements[0].parentNode.removeChild(elements[0]);
	}
	
}
