import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import './translations/firebase';
import {TranslationGame} from './TranslationGame/TranslationGame';
import {Admin} from './Admin/Admin';
import {Connexion} from './Connexion/Connexion';
import {UserContext} from './User/UserContext';
import {onAuthStateChanged} from './translations/firebase';
import {Languages} from './Languages/Languages';
import {ENGLISH, FRENCH} from './Languages/LanguageContext';

const LOBBY = Symbol();
const GAME = Symbol();
const ADMIN = Symbol();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: LOBBY,
      sourceLang: ENGLISH,
      targetLang: FRENCH,
      user: null,
    };

    onAuthStateChanged((user) => this.setState({user}))
  }

  swapLang() {
    this.setState({
      sourceLang: this.state.targetLang,
      targetLang: this.state.sourceLang,
    })
  }

  changeSourceLang(lang) {
    this.setState({sourceLang: lang})
  }

  changeTargetLang(lang) {
    this.setState({targetLang: lang})
  }

  play() {
    this.setState({status: GAME});
  }

  admin() {
    this.setState({status: ADMIN});
  }

  lobby() {
    this.setState({status: LOBBY});
  }

  render() {
    const {status, sourceLang, targetLang, user} = this.state;
    return (
      <UserContext.Provider value={user}>
        <nav className="navbar navbar-dark bg-dark">
          <a className="navbar-brand App-brand" href="#">Babbel</a>
          <div className="d-flex align-items-center">
            <Languages lang={sourceLang} changeLang={this.changeSourceLang.bind(this)}/>
            <i className="fas fa-exchange-alt"
               onClick={this.swapLang.bind(this)}
               style={{cursor: 'pointer', color:'var(--light)', fontSize: '1.5em', margin: '0px 5px'}}/>
            <Languages lang={targetLang} side="right" changeLang={this.changeTargetLang.bind(this)}/>
          </div>
          <Connexion/>
        </nav>
        <div className="container-fluid App">
          <div className="jumbotron jumbotron-fluid">
            <div className="container">
              <h1 className="display-4 text-center"> Learn with 💕</h1>
            </div>
          </div>
          {status === LOBBY &&
          <div className="row m-auto App-lobby">
            <button className="btn btn-primary btn-lg btn-block" type="submit" onClick={this.play.bind(this)}>
              <i className="fas fa-gamepad"/> Play
            </button>
            {user &&
            <button className="btn btn-primary btn-lg btn-block" type="submit" onClick={this.admin.bind(this)}>
              <i className="fas fa-cog"/> Admin
            </button>
            }
          </div>
          }
          {status === GAME && <TranslationGame sourceLang={sourceLang.name} targetLang={targetLang.name} quit={this.lobby.bind(this)}/>}
          {status === ADMIN && <Admin sourceLang={sourceLang.name} targetLang={targetLang.name} quit={this.lobby.bind(this)}/>}
        </div>
      </UserContext.Provider>
    )
  }
}

export default App;
