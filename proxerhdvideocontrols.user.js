// ==UserScript==
// @name         Proxer.me HD-Video Controls
// @namespace    http://stream.proxer.me
// @version      1.1
// @description  Diese Erweiterung fügt den Proxer HD Videos zusätzliche Kontrolloptionen hinzu.
// @author       Desnoo
// @include      http://stream.proxer.me/*
// @include      https://stream.proxer.me/*
// @run-at       document-end
// ==/UserScript==

var volumeCookieName = "hd-vol";

var volumeStep = 0.01;
var durationProgressStep = 5;
var skipDurationOpening = 70;
var space = 32;
var arrowUp = 38;
var arrowDown = 40;
var arrowLeft = 37;
var arrowRight = 39;
var k = 75;
var l = 76;


document.domain = 'proxer.me';

$(document).ready(function (e) {
  var isFullScreen = false;
  var $video = $('video');
  if ($video[0] === undefined) {
    console.log('Video reference not found.');
    return;
  }
  
  var videoReference = $video[0];
  setVolumeByCookie(videoReference);
  
  $video.on('volumechange', function(e){
	  document.cookie = volumeCookieName + "=" + videoReference.volume;
  });
  
  $video.on('canplay', function () {
    $video.on('SkipTime', function (e, timeToSkip) {
      videoReference.currentTime += timeToSkip;
      $video.off('SkipTime');
    });
  });
  $video.on('click', function (e) {
    togglePlay();
  });
  $video.on('dblclick', function (e) {
    toggleFullScreen();
  });
  $(document).keydown(function (e) {
    switch (e.which) {
      case arrowUp:
        videoReference.volume = Math.min(videoReference.volume + volumeStep, 1);
        break;
      case arrowDown:
        videoReference.volume = Math.max(videoReference.volume - volumeStep, 0);
        break;
    }
  });
  $(document).keyup(function (e) {
    switch (e.which) {
      case space:
        togglePlay();
        break;
      case k:
        $video.trigger('SkipTime', [
          - skipDurationOpening
        ]);
        break;
      case l:
        $video.trigger('SkipTime', [
          skipDurationOpening
        ]);
        break;
      case arrowLeft:
        $video.trigger('SkipTime', [
          - durationProgressStep
        ]);
        //videoReference.currentTime = Math.max(videoReference.currentTime - durationProgressStep,videoReference.currentTime);
        break;
      case arrowRight:
        $video.trigger('SkipTime', [
          durationProgressStep
        ]);
        //videoReference.currentTime = Math.min(videoReference.currentTime + durationProgressStep,videoReference.currentTime);
        break;
    }
  });
  // Entering fullscreen mode
  $video.bind('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', function (e) {
    var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement;
    var event = state ? 'FullscreenOn' : 'FullscreenOff';
    $video.trigger(event);
  });
  $video.on('FullscreenOn', function (e) {
    videoReference.play();
    isFullScreen = true;
  });
  $video.on('FullscreenOff', function (e) {
    isFullScreen = false;
  });
  // toggles play/pause mode
  function togglePlay() {
    if (videoReference.paused) {
      videoReference.play();
    } else {
      videoReference.pause();
    }
  }
  // toggle fullscreen mode

  function toggleFullScreen() {
    if (!isFullScreen) { // current working methods
      if (document.documentElement.requestFullscreen) {
        videoReference.requestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        videoReference.msRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        videoReference.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        videoReference.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }
  // checks and evaluates volume cookie
	function setVolumeByCookie(_VideoRef){
		var volume = getCookie(volumeCookieName);
		videoReference.volume = volume !== "" ? volume : videoReference.volume;
	}

	function getCookie(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i=0; i<ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)===' ') c = c.substring(1);
			if (c.indexOf(name) === 0) return c.substring(name.length,c.length);
		}
		return "";
	}
});