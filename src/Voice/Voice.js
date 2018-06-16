import React, {Component} from 'react';

export class Voice extends Component {

  componentDidMount() {
    speechSynthesis.onvoiceschanged = () => {}; // load voices
  }

  play() {
    const utterance = new SpeechSynthesisUtterance();
    utterance.pitch = 1;
    utterance.rate = 0.8;
    utterance.text = this.props.text;
    utterance.voice = speechSynthesis.getVoices().filter(voice => voice.lang === this.props.lang)[0];
    speechSynthesis.speak(utterance);
  }

  render() {
    return <i className="fas fa-volume-up" style={{cursor: 'pointer', color: 'var(--primary)'}} onClick={this.play.bind(this)}/>
  }
}