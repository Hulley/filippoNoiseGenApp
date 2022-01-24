 React from 'react';

import { ProgressBar } from './ProgressBar';
const axios = require('axios');

const playlist = [
  {id: 0, url: require('../media/0.1 INTRO.wav')},
  {id: 1, url: require('../media/0.2 QUARTO DI SECOLO.wav')},
  {id: 2, url: require('../media/0.3 ADDIO.wav')},
  {id: 3, url: require('../media/0.5 DRUG FIENDS.wav')},
  {id: 4, url: require('../media/0.6 NASCOSTO IN PIENA LUCE.wav')},
  {id: 5, url: require('../media/0.7 SILENZIO E SOLITUDINE .wav')},
  {id: 6, url: require('../media/0.8 INTERLUDIO.wav')},
  {id: 7, url: require('../media/0.9 IN FONDO ALLORIZZONTE.wav')},
  {id: 8, url: require('../media/0.9 lLI IN FONDO ALLORIZZONTE.wav')},
  {id: 9, url: require('../media/0.10 SPLENDENTE AL BUIO.wav')},
  {id: 10, url: require('../media/0.11 ROMA AL PARADISO.wav')},
  {id: 11, url: require('../media/0.12 CORRENDO VERSO LA VITA CORRENDO VERSO LA MORTE [02].wav')},
]

const getSecondsToMinutesAndSeconds = time => {
  if (time === 0) {
    return '0 : 00';
  }
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;
  return `${minutes} : ${seconds}`;
};

const iconStyles = {
  cursor: 'pointer',
  color: '#472F90',
};

export class AudioPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      audioPlayer: null,
      lpfFilter: null,
      currentTrack: 0,
      currentTrackDuration: 0,
      currentTrackMoment: 0,
      loopStartMoment: 0.0,
      loopEndMoment: 0.0,
      loopState: 'unset',
      progressBarWidth: 0,
      isPlaying: false
    };
  }

  initPlayer = () => {
    const audioPlayer = document.getElementById('audioPlayer');
    this.setState({audioPlayer: audioPlayer});
    const audioContext = this.props.audioContext;

    console.log(audioPlayer);
    // const source = audioContext.createMediaElementSource(audioPlayer);
    // console.log(audioPlayer.buffered);

    let source = audioContext.createBufferSource();
    let request = new XMLHttpRequest();
    axios.get(playlist[this.state.currentTrack].url).then(response=>{
      audioContext.decodeAudioData(response, function(buffer) {
          console.log('debug');
          let myBuffer = buffer;
          source.buffer = myBuffer;
          source.playbackRate.value = this.state.playbackRate;
          source.connect(audioContext.destination);
          source.loop = true;
          console.log(audioContext);
        });
    })

    var filter = audioContext.createBiquadFilter(audioContext.LOWPASS);
    source.connect(filter);
    filter.connect(audioContext.destination);
    this.setState({lpfFilter: filter});

    this.setState({currentTrackDuration: 0});
    this.setState({currentTrackMoment: 0});
    this.setState({progressBarWidth: '0'});
  };

  handleStop = () => {
    this.state.audioPlayer.pause();
    this.state.audioPlayer.currentTime = 0.0;
    this.state.isPlaying = false;
    this.state.currentTrackMoment = 0;
  };

  handlePlay = () => {
    if (this.state.audioPlayer.paused || this.state.audioPlayer.ended || this.state.audioPlayer.played === 0) {
      this.state.audioPlayer.load();
      this.state.audioPlayer.play();
      this.setState({isPlaying: true});
    } else {
      this.state.audioPlayer.pause();
      this.setState({isPlaying: false});
    }
  };

  handleMetadata = () => {
    if(this.props.appStarted){
      const duration = Math.floor(this.state.audioPlayer.duration);
      this.setState({currentTrackDuration: getSecondsToMinutesAndSeconds(duration)});
    }
  };

  handleTimeupdate = () => {
    if(this.state.loopState === 'loop'){
      if(this.state.audioPlayer.currentTime >= this.state.loopEndMoment){
        this.state.audioPlayer.currentTime = this.state.loopStartMoment;
      }
    } else {
      this.setState({currentTrackMoment: Math.floor(this.state.audioPlayer.currentTime)});
      this.setState({progressBarWidth: (
        Math.floor((this.state.audioPlayer.currentTime / this.state.audioPlayer.duration) * 100) + '%'
      )});
      if (this.state.audioPlayer.currentTime === this.state.audioPlayer.duration) {
        this.handleNextTrack();
      }
    }
  };
  handleNextTrack = () => {
    console.log('next track');
    if (this.state.currentTrack === playlist.length - 1) {
      this.setState({currentTrack: 0});
    } else {
      this.setState({currentTrack: this.state.currentTrack + 1});
    }
    this.state.audioPlayer.load();
    if(this.state.isPlaying){
      this.state.audioPlayer.play();
    }
  };
  handlePrevTrack = () => {
    if (this.state.currentTrack === 0) {
      this.setState({currentTrack: playlist.length - 1});
    } else {
      this.setState({currentTrack: this.state.currentTrack - 1});
    }

  };

  handleXevent = (cursorCallback, isCurrentlyLocked) => {
    if(this.state.isPlaying){
      if (this.state.loopState === 'unset'){
        if(isCurrentlyLocked){
          cursorCallback(false);
          return;
        }
        this.setState({loopStartMoment: this.state.currentTrackMoment});
        this.setState({loopState: 'start'});
        cursorCallback(true);
      } else if (this.state.loopState === 'start'){
        this.setState({loopEndMoment: this.state.currentTrackMoment});
        this.setState({loopState: 'loop'});
        // this.state.audioPlayer.pause();
        // this.state.audioPlayer.loop = true;
        // this.state.audioPlayer.loopStart = this.state.loopStartMoment;
        // this.state.audioPlayer.loopEnd = this.state.loopEndMoment;
        // this.state.audioPlayer.play();
      } else if (this.state.loopState === 'loop'){
        this.setState({loopStartMoment: 0.0});
        this.setState({loopEndMoment: 0.0});
        this.setState({loopState: 'unset'});
        cursorCallback(false);
      } else {
        console.error('issue with the looping lifecycle')
      }
    } else {
      // handle x input if audio is not playing
      this.setState({loopStartMoment: 0.0});
      this.setState({loopEndMoment: 0.0});
      this.setState({loopState: 'unset'});
      cursorCallback(!isCurrentlyLocked)
    }
  }

  componentDidMount = () => {
    this.initPlayer();
  }

  componentDidUpdate = () => {
    this.state.audioPlayer.playbackRate = this.props.playbackRate;
    this.state.lpfFilter.frequency.value = this.props.lpfValue;
  }

  render() {
    return (
      <div id="audioPlayerContainer" style={{
        zIndex: 2,
        position: 'absolute',
        bottom: '0',
        opacity: 0,
        display: `${this.props.showPlayerControls ? 'flex' : 'none'}`,
        justifyContent: 'center',
        width: '100%'
      }}>
        <audio
          id="audioPlayer"
          preload="metadata"
          onLoadedMetadata={this.handleMetadata}
          onTimeUpdate={() => this.handleTimeupdate()}
        >
          <source src={playlist[this.state.currentTrack].url} type="audio/ogg" />
          Ooops, your browser is sooo old.
        </audio>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div
            style={iconStyles}
            onClick={this.handlePrevTrack}
            size={30}
          />
          <div
            style={iconStyles}
            onClick={this.handlePlay}
            size={30}
          />
          <div
            size={30}
            style={iconStyles}
            onClick={this.handleStop}
          />
          <div
            style={iconStyles}
            onClick={this.handleNextTrack}
            size={30}
          />
          {/* start counter */}
          <p style={{
            fontSize: '0.65rem',
            margin: '0 1rem',
            color: '#472f90',
          }}>
            {getSecondsToMinutesAndSeconds(this.state.currentTrackMoment)}
          </p>
          <ProgressBar progressPercent={this.state.progressBarWidth} width={'200px'} />
          {/* end counter */}
          <p style={{
            fontSize: '0.65rem',
            margin: '0 1rem',
            color: '#472f90',
          }}>{this.state.currentTrackDuration || '0 : 00'}
          </p>
        </div>
      </div>
    );
  }
}