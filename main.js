// Shorthand for $( document ).ready()
$(function() {
    console.log( "ready!" );
    $("#save").hide();
	$("#edit").hide();
    $("#file").change(function(){
         //submit the form here
         $("#upload-label").text("File selected.")
         $("#upload-label").css("background-color", "white")
         $("#upload-label").css("border", "none")
	 });

     $("#picture-file").change(function(){
         //submit the form here
         $("#upload-label").text("File selected.")
         $("#upload-label").css("background-color", "white")
         $("#upload-label").css("border", "none")
	 });

    $('#submit').click(function (event) {

		event.preventDefault()
		var file = $('#file').get(0).files[0];
		var formData = new FormData();
		formData.append('file', file);

		$('#upload-form').hide();
		$('#loader').show();


		$.ajax({
			url: '.',
			//Ajax events
			beforeSend: function (e) {
				console.log("sending to server for processing")
			},
			success: function (data) {

				var transcriptions = parseTranscription(data.results)
				transcriptions.encoding = data.encoding;

				// displayTranscriptions(transcriptions)

				if (data.encoding == "video"){
					loadVideoAndTranscribe(file, transcriptions)
				} else if (data.encoding == "audio") {
					console.log(transcriptions)
					displayTranscriptions(transcriptions)
				}
				
				$('#loader').hide();	

			},
			error: function (e) {
				alert('error ' + e.message);

				$('#upload-form').show();
				$('#loader').hide();
			},
			// Form data
			data: formData,
			type: 'POST',
			//Options to tell jQuery not to process data or worry about content-type.
			cache: false,
			contentType: false,
			processData: false
		});
		return false;
	});


	$('#picture-submit').click(function (event) {

		$('#picture-form').hide();
		$('#loader').show();
	});

	// ParticlesJS Config.
	createParticles();



});
/** Check encoding and recall page load methods to load new 
		    transcriptions to the page.                              **/
function loadVideoAndTranscribe(file, transcriptions) {

	$("#transcribed-video").html('<video class="video-js vjs-default-skin" controls \
		width="720" height="480" id="video">\
			<source src="'+URL.createObjectURL(file)+'" \
			type="'+file.type+'">\
		</video>')

	var video = document.getElementById("video")
	video.load()

	$("#edit").show();

	video.addEventListener("loadedmetadata", function() {
		var track = this.addTextTrack("captions", "English", "en");
		track.mode = "showing";

		for (var i = 0; i < transcriptions.length; i++) {

			track.addCue(new VTTCue(transcriptions[i].start_time, 
				transcriptions[i].end_time, 
				transcriptions[i].transcription));
				console.log(transcriptions[i].transcription);

		}

		// track.addCue(new VTTCue(0, 12, "[Test]"));
		// track.addCue(new VTTCue(18.7, 21.5, "This blade has a dark past."));
		// track.addCue(new VTTCue(22.8, 26.8, "It has shed much innocent blood."));
	
		var video = videojs('video')

		// Initialize the plugin.
		var transcript = video.transcript();
		// Then attach the widget to the page.
		var transcriptContainer = document.querySelector('#transcript');
		transcriptContainer.prepend(transcript.el()); 
		//<input id="submit" class="btn btn-success" type="submit" value="Transcribe!">

	    
		// $('#upload-form').show();
		$('#loader').hide();

	});
	
	// on edit click
    $('#edit').click(function(event) 
	{
		/** Hide edit button and show save button then call the prevent 
		    defaults method and set the content editable attribute so that
		    users can edit the span elemnts with the transcription text. Change
		    classes to edit classes to stop from time jumps during editing  **/

		event.preventDefault();

		$("#edit").hide();
		$("#save").show();

		$(".transcript-text").attr("contenteditable", "true");
		$(".transcript-text").attr("class", "editing-text");
		$(".transcript-timestamp").attr("class", "editing-timestamp");
	
	});

	// on save click
	$('#save').click(function(event) 
	{
		event.preventDefault();
		/** Hide save button and show edit button **/
		$("#save").hide();
		$("#edit").show();
	
		/** Iterate through transcriptions and set to edited span elements **/
		for (var i = 0; i < $(".editing-text").length; i++) 
		{ 
			if(transcriptions[i] != "video" && transcriptions[i] != "audio")
			{
				transcriptions[i].transcription = $(".editing-text")[i].innerHTML;
			}
		}

		/** Output json to console for testing purposes **/
		// console.log("after");
		// console.log("=====");
		// console.log(transcriptions);

		/** Make span elements uneditable and remove old transcription and video **/
		$(".editing-text").attr("contenteditable", "false");
		$(".editing-timestamp").attr("contenteditable", "false");

		videojs('video').dispose();

		$("#transcript-video").remove();
		$("#video").remove();
		// reload
		loadVideoAndTranscribe(file, transcriptions);
		
	});


}


// function changeTranscriptions(i, transcriptions, new_text){
// 	transcriptions[i].transcription = new_text
// 	loadVideoAndTranscribe(file, transcriptions)
// }


function displayTranscriptions(transcriptions) {

	for (var i = 0; i < transcriptions.length; i++){
		$('<div/>', {
			id: "transcription-"+i,
		    class: "row"
		}).appendTo('#transcriptions');

		$('<p/>', {
		    class: "transcription",
		    text: "[" + transcriptions[i].start_time + " - " + transcriptions[i].end_time + "]: "+transcriptions[i].transcription
		}).appendTo('#transcription-'+i);
		
		// $('<p/>', {
		//     class: "confidence",
		//     text: transcriptions[i].confidence
		// }).appendTo('#transcription-'+i);

		// $('<p/>', {
		//     class: "start-time",
		//     text: transcriptions[i].start_time
		// }).appendTo('#transcription-'+i);

		// $('<p/>', {
		//     class: "end-time",
		//     text: transcriptions[i].end_time
		// }).appendTo('#transcription-'+i);
	}
	$("#edit").appendTo("#over-div");
	$("#save").appendTo("#over-div");
	$("#edit").show();

	$('#edit').click(function(event) 
	{
		

		/** Call the prevent defaults method, hide edit button and show the 
		    save button. Then set the content editable attribute so that
		    users can edit the p elemnts with the transcription text. Change
		    classes to edit classes to stop from time jumps during editing  **/

		event.preventDefault();
		$("#edit").hide();
		$("#save").show();
		$("p.transcription").attr("contenteditable", "true");
	});

	$('#save').click(function(event) 
	{
		/** Hide save button and show edit button **/
		$("#save").hide();
		$("#edit").show();
	
		console.log(transcriptions);
		/** Iterate through transcriptions and set to edited span elements **/
		for (var i = 0; i < $("p.transcription").length; i++) 
		{ 
			if(transcriptions[i] != "video" && transcriptions[i] != "audio")
			{
				transcriptions[i].transcription = $("p.transcription")[i].innerHTML;
			}
		}
		/** make the content editable attribute the opposite of true **/ 
		$("p.transcription").attr("contenteditable", "false");

	});
}



function parseTranscription(data) {

	var transcriptions = []
	var transcripts = data.parsed_transcripts

	for (var i = 0; i < transcripts.length; i++){
		transcriptions.push({
			transcription: transcripts[i].sentence,
			start_time: transcripts[i].start_time,
			end_time: transcripts[i].end_time
		})
	}

	return transcriptions

}





function createParticles() {

	var colors = ["#2ecc71", "#27ae60", "#16a085", "#1abc9c"]

	var elementName = "particles"
	if($('#particles').length != 0) elementName = "particles"
	if($('#particles-splash').length != 0) elementName = "particles-splash"

	particlesJS(elementName, {
	  "particles": {
	    "number": {
	      "value": 64,
	      "density": {
	        "enable": true,
	        "value_area": 700
	      }
	    },
	    "color": {
	      "value": colors
	    },
	    "shape": {
	      "type": "circle",
	      "stroke": {
	        "width": 0,
	        "color": "#000000"
	      },
	      "polygon": {
	        "nb_sides": 15
	      }
	    },
	    "opacity": {
	      "value": 0.5,
	      "random": true,
	      "anim": {
	        "enable": false,
	        "speed": 1.5,
	        "opacity_min": 0.15,
	        "sync": false
	      }
	    },
	    "size": {
	      "value": 15,
	      "random": true,
	      "anim": {
	        "enable": true,
	        "speed": 2,
	        "size_min": 0.15,
	        "sync": false
	      }
	    },
	    "line_linked": {
	      "enable": true,
	      "distance": 110,
	      "color": "#33b1f8",
	      "opacity": 0.25,
	      "width": 1
	    },
	    "move": {
	      "enable": true,
	      "speed": 1.6,
	      "direction": "none",
	      "random": false,
	      "straight": false,
	      "out_mode": "out",
	      "bounce": false,
	      "attract": {
	        "enable": false,
	        "rotateX": 600,
	        "rotateY": 1200
	      }
	    }
	  },
	  "interactivity": {
	    "detect_on": "canvas",
	    "events": {
	      "onhover": {
	        "enable": true,
	        "mode": "repulse"
	      },
	      "onclick": {
	        "enable": true,
	        "mode": "push"
	      },
	      "resize": true
	    },
	    "modes": {
	      "grab": {
	        "distance": 400,
	        "line_linked": {
	          "opacity": 1
	        }
	      },
	      "bubble": {
	        "distance": 400,
	        "size": 40,
	        "duration": 2,
	        "opacity": 8,
	        "speed": 3
	      },
	      "repulse": {
	        "distance": 200,
	        "duration": 0.4
	      },
	      "push": {
	        "particles_nb": 4
	      },
	      "remove": {
	        "particles_nb": 2
	      }
	    }
	  },
	  "retina_detect": true
	});

	// var count_particles, stats, update;
	// stats = new Stats;
	// stats.setMode(0);
	// stats.domElement.style.position = 'absolute';
	// stats.domElement.style.left = '0px';
	// stats.domElement.style.top = '0px';
	// document.body.appendChild(stats.domElement);
	// count_particles = document.querySelector('.js-count-particles');
	// update = function() {
	//   stats.begin();
	//   stats.end();
	//   if (window.pJSDom[0].pJS.particles && window.pJSDom[0].pJS.particles.array) {
	//     count_particles.innerText = window.pJSDom[0].pJS.particles.array.length;
	//   }
	//   requestAnimationFrame(update);
	// };
	// requestAnimationFrame(update);;
}