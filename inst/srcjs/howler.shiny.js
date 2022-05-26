var Howler = function(el) {
  var self = this;
  this.id = el.id;
  this.index = 0;
  this.mouseDown = false;

  if (document.getElementById(`$(el.id}_volume_slider`)) {
    this.volume = document.getElementById(`$(el.id}_volume_slider`).dataset.volume;
  } else {
    this.volume = el.dataset.volume;
  }

  this.seekRate = el.dataset.seekRate;
  this.playlist = JSON.parse(el.dataset.audioFiles);
  this.titles = JSON.parse(el.dataset.trackTitles);
  this.autoContinue = el.dataset.autocontinue === "TRUE";
  this.autoLoop = el.dataset.autoloop === "TRUE";
  this.autoPlayNext = true;
  this.autoPlayPrevious = true;
  this.muted = false;

  this.createHowl = function() {
    var track = self.playlist[self.index];
    var title = self.titles[self.index];

    return new Howl({
      src: track,
      format: self.getTrackFormat(track),
      volume: self.volume,

      onload: function() {
        Shiny.setInputValue(`${self.id}_track`, track);

        var current_track_tag  = document.getElementById(`${self.id}_current_track`);
        if (current_track_tag) {
          current_track_tag.innerHTML = title
        }

        Shiny.setInputValue(`${self.id}_duration`, self.player.duration());
        if (self.seekRate > 0) {
          Shiny.setInputValue(`${self.id}_seek`, self.player.seek());
        }
        self.updateSeekSlider(new_track = true);
      },

      onplay: function() {
        Shiny.setInputValue(`${self.id}_playing`, true);
        self.setPlayPauseButton('pause');
      },

      onpause: function() {
        Shiny.setInputValue(`${self.id}_playing`, false);
        self.setPlayPauseButton('play');
      },

      onstop: function() {
        Shiny.setInputValue(`${self.id}_playing`, false);
        self.setPlayPauseButton('play');
      },

      onend: function() {
        if (self.autoContinue && !(!self.autoLoop && self.index === (self.playlist.length - 1)) && !self.mouseDown) {
          self.changeNextTrack();
        } else {
          Shiny.setInputValue(`${self.id}_playing`, false);
          self.setPlayPauseButton('play');
        }
      },

      onseek: function() {
        Shiny.setInputValue(`${self.id}_seek`, self.player.seek());
      }
    });
  };

  this.getTrackFormat = function(track) {
    if (typeof(track) === 'string') {
      if (track.includes('base64,')) {
        return null;
      } else {
        var file_type = track.split('.').pop().split('?', 1)[0];
        return file_type === 'mp4' ? 'dolby' : file_type;
      }
    } else {
      return track.map(self.getTrackFormat);
    }
  };

  this.updateSeekSlider = function(new_track = false) {
    var sliderElement = document.getElementById(self.id + '_seek_slider');

    if (sliderElement) {
      sliderElement.value = self.player.seek();
      if (new_track) {
        sliderElement.max = self.player.duration();
      }
    }
  };

  this.changeNextTrack = function(playTrack = true) {
    if (self.index === (self.playlist.length - 1)) {
      self.index = 0;
    } else {
      self.index++;
    }

    self.changeTrack(playTrack);
  };

  this.changePreviousTrack = function(playTrack = true) {
    if (self.index === 0) {
      self.index = self.playlist.length - 1;
    } else {
      self.index--;
    }

    self.changeTrack(playTrack);
  };

  this.changeTrack = function(playTrack = true) {
    self.player.stop();
    self.player = self.createHowl();

    if (playTrack) {
      self.player.play();
      self.setPlayPauseButton('pause');
    }
  };

  this.setPlayPauseButton = function(icon = 'play') {
    var iconElement = document.getElementById(self.id + '_play_pause').firstElementChild;

    if (iconElement) {
      var addIcon = icon === 'play' ? 'fa-play' : 'fa-pause';
      var removeIcon = icon === 'play' ? 'fa-pause' : 'fa-play';
      $(iconElement).removeClass(removeIcon).addClass(addIcon);
    }
  };

  this.moveVolumeSlider = function() {
    var sliderElement = document.getElementById(self.id + '_volume_slider');

    if (sliderElement) {
      sliderElement.value = self.player.volume();
    }
  };

  this.seekTrack = function(time) {
    self.player.seek(time);
  };

  this.player = this.createHowl();

  var seekSlider = document.getElementById(self.id + '_seek_slider');
  if (seekSlider) {
    setInterval(() => {
      if (!self.mouseDown) {
        seekSlider.value = self.player.seek();
      }
    }, 10);
  }

  if (self.seekRate > 0) {
    setInterval(() => {
      var trackSeek = self.player.seek();
      Shiny.setInputValue(`${self.id}_seek`, Math.round(trackSeek * 100) / 100);
    }, self.seekRate);
  }

  $(`#${this.id}_play`).on("click", function(e) {
    self.player.play();
  });

  $(`#${this.id}_play_pause`).on("click", function(e) {
    if (self.player.playing()) {
      self.player.pause();
    } else {
      self.player.play();
    }
  });

  $(`#${this.id}_pause`).on("click", function(e) {
    self.player.pause();
  });

  $(`#${this.id}_stop`).on("click", function(e) {
    self.player.stop();
    Shiny.setInputValue(`${self.id}_playing`, false);
  });

  $(`#${this.id}_next`).on("click", function(e) {
    self.changeNextTrack(self.autoPlayNext);
  });

  $(`#${this.id}_previous`).on("click", function(e) {
    self.changePreviousTrack(self.autoPlayPrevious);
  });

  $(`#${this.id}_forward`).on("click", function(e) {
    var time = Math.min(self.player.duration(), self.player.seek() + Number(this.dataset.seekChange));
    self.seekTrack(time);
  });

  $(`#${this.id}_back`).on("click", function(e) {
    var time = Math.max(0, self.player.seek() + Number(this.dataset.seekChange));
    self.seekTrack(time);
  });

  $(`#${this.id}_volumeup`).on("click", function(e) {
    var volumeChange = this.dataset.volumeChange ? Number(this.dataset.volumeChange) : 0.1;

    self.volume = Math.min(1, Number(self.player.volume()) + volumeChange);
    self.player.volume(self.volume);
    self.moveVolumeSlider();
  });

  $(`#${this.id}_volumedown`).on("click", function(e) {
    var volumeChange = this.dataset.volumeChange ? Number(this.dataset.volumeChange) : 0.1;

    self.volume = Math.max(0, Number(self.player.volume()) - volumeChange);
    self.player.volume(self.volume);
    self.moveVolumeSlider();
  });

  $(`#${this.id}_volumetoggle`).on("click", function(e) {
    var volume_value = self.muted ? self.volume : 0;
    self.player.volume(volume_value);
    self.moveVolumeSlider();

    var iconElement = document.getElementById(self.id + '_volumetoggle').firstElementChild;
    var addIcon = self.muted ? 'fa-volume-up' : 'fa-volume-mute';
    var removeIcon = self.muted ? 'fa-volume-mute' : 'fa-volume-up';
    $(iconElement).removeClass(removeIcon).addClass(addIcon);

    self.muted = !self.muted;
  });

  $(`#${this.id}_seek_slider`).on("mousedown", function(e) {
    self.mouseDown = true;
  });

  $(`#${this.id}_seek_slider`).on("mouseup", function(e) {
    self.mouseDown = false;
    var time = Number(this.value);
    self.seekTrack(time);
  });

  $(`#${this.id}_volume_slider`).on("change", function(e) {
    var vol = this.value;
    self.volume = vol;
    self.player.volume(vol);
  });
}

var howlerPlayers = [];

$(document).on('shiny:connected', () => {
  var howlers = document.getElementsByClassName('howler-player');

  for (i = 0; i < howlers.length; i++) {
    howlerPlayers.push(new Howler(howlers[i]));
  }
});

$(document).on('shiny:disconnected', () => {
  howlerPlayers.forEach(x => { x.player.stop(); })
});

Shiny.addCustomMessageHandler('addHowlerTrack', function(message) {
  var howl = howlerPlayers.filter(x => x.id === message.id)[0];

  howl.playlist.push(message.file)

  if (message.play) {
    howl.index = howl.playlist.length - 1;
    howl.changeTrack()
  }
});

Shiny.addCustomMessageHandler('changeHowlerTrack', function(message) {
  var howl = howlerPlayers.filter(x => x.id === message.id)[0];
  var playlist = howl.playlist.map(x => {
    if (typeof(x) === 'string') {
      return x.split('/').pop();
    } else {
      return x.map(y => { return y.split('/').pop(); });
    }
  })

  var newIndex = playlist.findIndex(x => { return x.includes(message.file); });
  if (newIndex > -1) {
    howl.index = newIndex;
    howl.changeTrack()
  }
});

Shiny.addCustomMessageHandler('playHowler', function(message) {
  var howl = howlerPlayers.filter(x => x.id === message)[0];
  if (!howl.player.playing()) {
    howl.player.play();
  }
});

Shiny.addCustomMessageHandler('pauseHowler', function(message) {
  var howl = howlerPlayers.filter(x => x.id === message)[0];
  howl.player.pause();
});

Shiny.addCustomMessageHandler('stopHowler', function(message) {
  var howl = howlerPlayers.filter(x => x.id === message)[0];
  howl.player.stop();
});

Shiny.addCustomMessageHandler('seekHowler', function(message) {
  var howl = howlerPlayers.filter(x => x.id === message.id)[0];
  howl.player.seek(message.seek);
});
