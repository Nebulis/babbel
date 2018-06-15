import React, {Fragment, Component} from 'react';
import './TranslationGame.css';
import {getAllTranslationsBy} from '../translations/firebase';
import {Loader} from '../Loader/Loader';

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

  componentDidMount() {
    getAllTranslationsBy(this.props.source, this.props.target)
      .then(translations => this.setState({translations, status: GUESSING}))
      .then(_ => this.inputRef.current.focus());
  }

  validate() {
    let timeout = 0;
    if (this.state.value === this.state.translations[this.state.index].target) {
      this.setState({status: SUCCESS});
      timeout = 1000;
    } else {
      this.setState({status: FAILED});
      timeout = 2500;
    }

    setTimeout(() => {
      this.inputRef.current.focus();
      this.setState({
        status: GUESSING,
        value: '',
        index: this.state.index + 1,
      });
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
        <h1 className="col text-center">{this.state.translations[index].source}</h1>
      </div>
      <div className="row">
          <form className="col justify-content-center form-inline">
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