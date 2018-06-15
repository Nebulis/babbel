import React, {Component, Fragment} from 'react';
import logo from './logo.svg';
import './App.css';
import './translations/firebase';
import {TranslationGame} from './TranslationGame/TranslationGame';
import {Admin} from './Admin/Admin';
import {Connexion} from './Connexion/Connexion';
import {UserContext} from './User/UserContext';
import {onAuthStateChanged} from './translations/firebase';

const LOBBY = Symbol();
const GAME = Symbol();
const ADMIN = Symbol();

const FRENCH = 'french';
const ENGLISH = 'english';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: LOBBY,
      source: ENGLISH,
      target: FRENCH,
      user: null,
    };

    onAuthStateChanged((user) => this.setState({user}))
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
    const {status, source, target, user} = this.state;
    return (
      <UserContext.Provider value={user}>
        <nav className="navbar navbar-dark bg-dark">
          <a className="navbar-brand" href="#">Babbel</a>
          <Connexion />
        </nav>
        <div className="container-fluid App">
          <div className="jumbotron jumbotron-fluid">
            <div className="container">
              <h1 className="display-4 text-center">Learn with 💕</h1>
              {this.state.source} <i className="fas fa-exchange-alt"/> {this.state.target}
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
          {status === GAME && <TranslationGame source={source} target={target} quit={this.lobby.bind(this)}/>}
          {status === ADMIN && <Admin source={source} target={target} quit={this.lobby.bind(this)}/>}
        </div>
      </UserContext.Provider>
    )
  }
}

export default App;
