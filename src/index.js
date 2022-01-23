import React from 'react';
import axios from "axios";
import ReactDOM from 'react-dom';
import anime from 'animejs/lib/anime.es.js';

import { AudioPlayer } from './components/AudioPlayer';
import { HelpDialogue } from './components/HelpDialogue';
import { Cursor } from './components/Cursor';

import './styles.css';

// Variables for adjusting the app
const showPlayerControls = true;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      color: '',
      textcolor: '#FFFFFF',
      message: "Press any key to start", 
      appStarted: false,
      cursorPos: {x: '50%', y: '50%'},
      cursorAtStartPos: true,
      cursorSpinTime: '1',
      //
      audioContext: null,
      cursorLocked: true,
      playbackRate: 1,
      lpfValue: 5000,
      refs: {
        helpDialogueRef: React.createRef(),
        audioPlayerRef: React.createRef()
      }
    };
  }
  // function runs to find data for setting color.
  // It does this asynchronously ( beside other stuff )
  updateColor = async () => {
    // time
    var time = new Date().getHours().valueOf() + new Date().getTimezoneOffset()/60 + 1
    if (time < 0){
      time += 24
    }
    // location
    var loc = {
      latitude: 47.996099, 
      longitude: 7.839826
    }
    // var loc = {
    //   latitude: -30.5997515,
    //   longitude: 152.9558991
    // }
    const apiKey = '461d73bda9d2f1404427751f29362b34'
    const lat = loc.latitude
    const long = loc.longitude
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${long}&appid=${apiKey}`
    );
    if(response.status === 200){
      var temp = response.data.main.temp
    }
    //  color
    var h = 240 - 8 * Math.max(0,Math.min(temp,30))
    var s = Math.random() * 100
    var b = 50 - Math.cos(Math.PI*time/12) * 40
    this.setState({color:(`hsl(${h},${s}%,${b}%)`)});
    // if the bg color is too dark set the text color to white
    // if(b < 30){
    //   this.setState({textcolor:'#FFFFFF'});
    // }

  }
  handleNextTrack = () => {
    this.state.refs.audioPlayerRef.current.handleNextTrack();
  };
  handlePlay = () => {
    this.state.refs.audioPlayerRef.current.handlePlay();
  };
  handleStop = () => {
    // let track = playlist[currentTrack].audio;
    // track.stop();
    // setCurrentTime(0.0);
    // setIsPlaying(false);
    // setCurrentTrackMoment(0);
  };
  captureMouseInput = (event) => {
    let appBg = document.getElementById('app-bg');
    let posX = event.pageX - appBg.offsetLeft;
    let posY = event.pageY - appBg.offsetTop;
    let prevX = this.state.cursorPos.x.match(/\d+/)[0]
    let prevY = this.state.cursorPos.y.match(/\d+/)[0]
    // bind to app area
    if(
      posX < 0 ||
      posY < 0 ||
      posX > appBg.clientWidth ||
      posY > appBg.clientHeight
    ){
      return
    }
    if(!this.state.cursorLocked){
      if(
        this.state.cursorAtStartPos ||
        Math.abs(posX - prevX) > 3 ||
        Math.abs(posY - prevY) > 3
      ){
        if(this.state.cursorAtStartPos){
          this.setState({cursorAtStartPos:false});
        }
        let cursorX = posX + 'px';
        let cursorY = posY + 'px';
        this.setState({cursorPos: {x: cursorX, y: cursorY}});
        // throttledStateUpdateHandler(posX,posY);
        let x = posX / appBg.clientWidth;
        let y = posY / appBg.clientHeight;

        this.updatePlayRate(x);
        // updateReverbWetness(y);
        this.updateLPF(y)
      }
    }
  }
  handleXevent = () => {
    this.state.refs.audioPlayerRef.current.handleXevent(this.setCursorLocked, this.state.cursorLocked);
  }
  setCursorLocked = locked => {
    this.setState({cursorLocked: locked});
  }
  updatePlayRate = x => {
    //  using an exponential function we keep the center to 1 and speed up the calculation
    const changeAmount = 3;
    let rate = Math.pow(changeAmount,(2*x - 1))
    this.setState({playbackRate: rate});
  }
  updateLPF = (y) => {
    let minValue = 40;
    let maxValue = this.state.audioContext.sampleRate / 2;
    // Logarithm (base 2) to compute how many octaves fall in the range.
    var numberOfOctaves = Math.log(maxValue / (minValue)) / Math.LN2;
    // Compute a multiplier from 0 to 1 based on an exponential scale.
    var multiplier = Math.pow(2, numberOfOctaves * (y - 1.0));
    // Get back to the frequency value between min and max.
    this.setState({lpfValue: maxValue * multiplier});

  }
  welcome = async () => {
    await anime({
      targets: '#message',
      opacity: 0,
      duration: 1000,
      easing: 'linear'
    }).finished
    this.setState({audioContext: new AudioContext(window.AudioContext || window.webkitAudioContext)});
    this.setState({appStarted:true});
    // show elements
    await anime({
      targets: '#cursor',
      opacity: 1,
      duration: 500,
      easing: 'linear'
    }).finished
    await anime({
      targets: '#audioPlayerContainer',
      opacity: 1,
      duration: 500,
      easing: 'linear'
    }).finished
    await anime({
      targets: '#helpDialogue',
      opacity: 1,
      duration: 500,
      easing: 'linear'
    }).finished
  }
  handleKeyDown = e => {
    // e.preventDefault();  
    if(this.state.appStarted){
      if(!e.isTrusted || e.location !== 0 ){
        return
      }
      if(e.key === 's'){
        this.handleNextTrack();
        return;
      }
      if(e.key === 'p'){
        this.handlePlay();
        return;
      }
      if(e.key === 'x'){
        this.handleXevent();
        return;
      }
      if(e.key === 'c'){
        this.handleStop();
        return;
      }
      if(e.key === 'h'){
        this.state.refs.helpDialogueRef.current.toggleShowHelp();
        return;
      }
    } else {
      this.welcome();
    }
    return;
  };

  // utility to make sure color setting function is only run once
  componentDidMount = () => {
    this.updateColor();
    document.addEventListener("keydown", this.handleKeyDown, false);
  };
  componentWillUnmount = () => {
    document.removeEventListener("keydown", this.handleKeyDown, false);
  };
  render() {
    return (
      <div className="App" style={{
        backgroundColor: '#1E1E1E',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        color: `${this.state.textcolor}`,
      }}>
        <div className='app-bg' id='app-bg' 
          onMouseMove={this.captureMouseInput}
          style={{
          background: `${this.state.color}`,
          width: '100vw',
          height: '50vw',
          maxWidth: '2400px',
          maxHeight: '100vh',
          textAlign: 'center',
          position: 'relative',
        }}>
          { this.state.appStarted &&
          <AudioPlayer 
            ref={this.state.refs.audioPlayerRef}
            audioContext={this.state.audioContext}
            lpfValue={this.state.lpfValue}
            playbackRate={this.state.playbackRate}
            showPlayerControls={showPlayerControls}
            appStarted={this.state.appStarted}
          />
          }
          <div id="message" style={{
            marginTop: '-1rem',
            lineHeight: '2rem',
            position: 'relative',
            width: '100%',
            top: '50%'
          }}>{this.state.message}</div>
          <Cursor 
            cursorPos={this.state.cursorPos} 
            spinTime={this.state.cursorSpinTime}
            appStarted={this.state.appStarted}
          />
        </div>
        <HelpDialogue ref={this.state.refs.helpDialogueRef}/>
      </div>
    );
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
