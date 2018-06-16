import React, {Fragment, Component} from 'react';
import './TranslationGame.css';
import {getAllTranslationsBy} from '../translations/firebase';
import {Loader} from '../Loader/Loader';
import {Voice} from '../Voice/Voice';

const FETCHING = Symbol();
const GUESSING = Symbol();
const FAILED = Symbol();
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
    };
  }

  getNextIndex(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  /**
   * Test if 2 strings are equals by:
   * - ignoring case
   * - ignoring diacritics.
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
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() === str2.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()
  }

  componentDidMount() {
    getAllTranslationsBy(this.props.source, this.props.target)
      .then(translations => this.setState({translations, status: GUESSING, index: this.getNextIndex(0, translations.length - 1)}))
      .then(_ => this.inputRef.current.focus());
  }

  validate() {
    let timeout = 0;
    if (this.stringEquals(this.state.value, this.state.translations[this.state.index].target)) {
      this.setState({status: SUCCESS});
      timeout = 1000;
    } else {
      this.setState({status: FAILED});
      timeout = 2500;
    }

    setTimeout(() => {
      this.setState({
        status: GUESSING,
        value: '',
        index: this.getNextIndex(0, this.state.translations.length - 1),
      }, () => this.inputRef.current.focus()); // set focus after
    }, timeout);
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

  render() {
    const {quit} = this.props;
    const {status, value, index} = this.state;

    if(status === FETCHING) {
      return <Loader />
    }

    const className = status === FAILED ? 'TranslationGame-error' : '';
    return <Fragment>
      <div className="row">
        <h1 className="col text-center">{this.state.translations[index].source} <Voice text={this.state.translations[index].source} lang="en-US"/></h1>
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
        {status === SUCCESS && <div className="col text-center"><i className="fas fa-check-circle fa-3x" style={{color: '#28a745'}}/></div>}
        {status === FAILED &&
          <div className="col text-center d-flex justify-content-center align-items-center">
            <i className="fas fa-times-circle fa-3x pr-2" style={{color: 'tomato'}} />
            <span className="pt-1 TranslationGame-expected">{this.state.translations[index].target}</span>
          </div>}
        {status === GUESSING && <div style={{minHeight: '48px'}}></div>}
      </div>

      <div className="row justify-content-center">
        <button className="btn btn-primary" type="button" onClick={quit}>
          <i className="fas fa-hourglass-end"/> Stop
        </button>
      </div>
    </Fragment>
      ;
  };
}