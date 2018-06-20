import React, {Fragment, Component} from 'react';
import './TranslationGame.css';
import {getAllTranslationsBy} from '../translations/firebase';
import {Loader} from '../Loader/Loader';
import {Voice} from '../Voice/Voice';
import {normalize} from '../Services/string';

// component status
const FETCHING = Symbol();
const GUESSING = Symbol();
const SUMMARIZING = Symbol();

// guesses status
const FAILURE = Symbol();
const SUCCESS = Symbol();

export class TranslationGame extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.state = {
      status: FETCHING,
      value: '',
      index: 0,
      translations: [],
      guesses: [],
    };
  }

  getNextIndex(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Test if 2 strings are equals by:
   * - ignoring case
   * - ignoring diacritics.
   * - ignoring trailing and leading spaces
   * - ignoring leading to (for english words)
   * @example
   * stringEquals('a', 'v'); // returns false
   * @example
   * stringEquals('frère', 'FRERE'); // returns true
   *
   * @param {string} str a string
   * @param {string} str2 another string
   * @return {boolean} true if both strings are equals, false otherwise
   */
  stringEquals(str, str2) {
    return normalize(str) === normalize(str2);
  }

  componentDidMount() {
    getAllTranslationsBy(this.props.sourceLang, this.props.targetLang)
      .then(translations => this.setState({
        translations,
        status: GUESSING,
        index: this.getNextIndex(0, translations.length - 1)
      }))
      .then(_ => this.inputRef.current && this.inputRef.current.focus());
  }

  validate() {
    let timeout = 0;
    let status;
    if (this.stringEquals(this.state.value, this.state.translations[this.state.index].target)) {
      status = SUCCESS;
      timeout = 1000;
    } else {
      status = FAILURE;
      timeout = 2500;
    }
    this.setState({status});
    setTimeout(() => {
      this.setState({
        status: GUESSING,
        value: '',
        index: this.getNextIndex(0, this.state.translations.length - 1),
        guesses: [
          ...this.state.guesses,
          {
            guessed: this.state.value,
            expected: this.state.translations[this.state.index].target,
            translation: this.state.translations[this.state.index].source,
            status,
          }
        ]
      }, () => this.inputRef.current.focus()); // set focus after
    }, timeout);
  }

  restart() {
    this.setState({
      status: GUESSING,
      value: '',
      index: this.getNextIndex(0, this.state.translations.length - 1),
      guesses: [],
    })
  }

  stop() {
    this.setState({status: SUMMARIZING});
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleOnKeyDown(event) {
    // on press enter
    if (event.keyCode === 13) {
      this.validate();
    }
  }

  renderGame() {
    const {status, value, index} = this.state;
    const translation = this.state.translations[index];
    const className = status === FAILURE ? 'TranslationGame-error' : '';

    return <Fragment>
      <div className="row">
        <h1 className="col text-center">{translation.source} <Voice text={translation.source} lang="en-US"/></h1>
      </div>
      <div className="row">
        {/* e.preventDefault is a fix for chrome/safari on iphone 8 (maybe more)*/}
        <form className="col justify-content-center form-inline" onSubmit={e => e.preventDefault()}>
          <input type="text"
                 className={`text-center form-control ${className}`}
                 ref={this.inputRef}
                 value={value}
                 onChange={this.handleChange.bind(this)}
                 onKeyDown={this.handleOnKeyDown.bind(this)}
                 disabled={status !== GUESSING}
          />
        </form>
      </div>
      <div className="row pt-2 pb-2">
        {status === SUCCESS &&
        <div className="col text-center"><i className="fas fa-check-circle fa-3x" style={{color: 'var(--success)'}}/>
        </div>}
        {status === FAILURE &&
        <div className="col text-center d-flex justify-content-center align-items-center">
          <i className="fas fa-times-circle fa-3x pr-2" style={{color: 'tomato'}}/>
          <span className="pt-1 TranslationGame-expected">{translation.target}</span>
        </div>}
        {status === GUESSING && <div style={{minHeight: '48px'}}></div>}
      </div>

      <div className="row justify-content-center">
        <button className="btn btn-primary" type="button" onClick={this.stop.bind(this)} disabled={status !== GUESSING}>
          <i className="fas fa-hourglass-end"/> Stop
        </button>
      </div>
    </Fragment>
  }

  renderSummary() {
    const {sourceLang, targetLang, quit} = this.props;
    const {guesses} = this.state;
    return (
      <Fragment>
        <div className="row justify-content-center pb-2">
          <button className="btn btn-primary mr-2" type="button" onClick={quit}>
            <i className="fas fa-chevron-left"/> Back to lobby
          </button>
          <button className="btn btn-primary" type="button" onClick={this.restart.bind(this)}>
            <i className="fas fa-sync-alt"/> Restart
          </button>
        </div>
        <table className="table">
          <thead>
          <tr className="d-flex">
            <th className="col-2"></th>
            <th className="col-5">{sourceLang.charAt(0).toUpperCase() + sourceLang.slice(1)}</th>
            <th className="col-5">{targetLang.charAt(0).toUpperCase() + targetLang.slice(1)}</th>
          </tr>
          </thead>
          <tbody>
          {
            guesses.map((guess, id) => (
              <tr key={id} className={`d-flex`}>
                <td className="col-2">
                  {
                    guess.status === FAILURE ?
                      <i className="fas fa-times-circle fa-3x pr-2" style={{color: 'tomato'}}/>
                      :
                      <i className="fas fa-check-circle fa-3x" style={{color: 'var(--success'}}/>
                  }
                </td>
                <td className="col-5 font-weight-bold d-flex align-items-center">{guess.translation}</td>
                <td className="col-5 d-flex align-items-center">
                  {guess.status === FAILURE && <span className="TranslationGame-failure">{guess.guessed}&nbsp;</span>}
                  <span className="TranslationGame-success">{guess.expected}</span>
                </td>
              </tr>))
          }
          </tbody>
        </table>
      </Fragment>
    )
  }

  render() {
    const {quit} = this.props;
    const {status, index} = this.state;
    const translation = this.state.translations[index];

    if (status === FETCHING) {
      return <Loader/>
    }
    if (!translation) {
      // no translation ? really ? display sth fancy
      return <div className="d-flex justify-content-center">
        <img src="https://media.giphy.com/media/nNxT5qXR02FOM/giphy.gif"/>
      </div>
    }
    return <Fragment>{status === SUMMARIZING ? this.renderSummary() : this.renderGame()}</Fragment>
  };
}