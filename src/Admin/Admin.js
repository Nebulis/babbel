import React, {Component, Fragment} from 'react';
import './Admin.css'
import {addTranslations, getAllTranslationsBy, deleteTranslations} from '../translations/firebase';
import {Loader} from '../Loader/Loader';
import {normalize} from '../Services/string';
import {Voice} from '../Voice/Voice';

const FETCHING = Symbol();
const SAVING = Symbol();
const ADDING = Symbol();

export class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceValue: '',
      targetValue: '',
      status: FETCHING,
      translations: []
    };
    this.sourceRef = React.createRef();
  }

  handleChangeSourceValue(event) {
    this.setState({sourceValue: event.target.value});
  }

  handleChangeTargetValue(event) {
    this.setState({targetValue: event.target.value});
  }

  getTranslations() {
    return getAllTranslationsBy(this.props.sourceLang, this.props.targetLang)
      .then(translations => this.setState({translations}))
      .then(_ => this.setState({status: ADDING}));
  }

  componentDidMount() {
    this.getTranslations();
  }

  // when one of the lang change then fetch new data
  componentDidUpdate(prevProps) {
    if(prevProps.sourceLang !== this.props.sourceLang || prevProps.targetLang !== this.props.targetLang ) {
      this.setState({status: FETCHING});
      this.getTranslations();
    }
  }

  delete({source, target}) {
    this.setState({status: FETCHING});
    deleteTranslations(this.props.sourceLang, this.props.targetLang, source, target)
      .then(this.getTranslations.bind(this));
  }

  add() {
    this.setState({
      status: SAVING,
    });
    addTranslations(this.props.sourceLang, this.props.targetLang, this.state.sourceValue, this.state.targetValue)
      .then(_ => {
        this.setState({
          sourceValue: '',
          targetValue: '',
        })
      })
      .then(() => this.sourceRef.current.focus())
      .then(this.getTranslations.bind(this));
  }

  render() {
    const {sourceLang, targetLang, quit} = this.props;
    const {sourceValue, targetValue, status, translations} = this.state;
    // compute translations matching the sourceValue
    // get only the 50 first items
    const filteredTranslations = translations.filter(translation => normalize(translation.source).includes(normalize(sourceValue))).slice(0, 50);

    if(status === FETCHING) {
      return <Loader />
    }

    return <Fragment>
      <div className="row justify-content-center pb-2">
        <button className="btn btn-primary" type="button" onClick={quit}>
          <i className="fas fa-chevron-left"/> Back to lobby
        </button>
      </div>
      <Fragment>
        <form>
          <div className="form-row">
            <div className="col-md-4 col-12">
              <input type="text"
                     ref={this.sourceRef}
                     value={sourceValue}
                     onChange={this.handleChangeSourceValue.bind(this)}
                     className="form-control"
                     placeholder={sourceLang.charAt(0).toUpperCase() + sourceLang.slice(1)}/>
            </div>
            <div className="col-md-4 col-12 pt-2 pt-md-0">
              <input type="text"
                     value={targetValue}
                     onChange={this.handleChangeTargetValue.bind(this)}
                     className="form-control"
                     placeholder={targetLang.charAt(0).toUpperCase() + targetLang.slice(1)}/>
            </div>
            <div className="col-md-4 col-12 pt-2 pt-md-0">
              <button className="btn btn-success btn-block" type="submit" onClick={this.add.bind(this)}
                      disabled={status === SAVING}>
                <i className="fas fa-plus-circle"/> Add
              </button>
            </div>
          </div>
        </form>
        <hr />
        <h2 className="text-center">{filteredTranslations.length} / {translations.length} translations</h2>
        <table className="table">
          <thead>
          <tr className="d-flex">
            <th className="col-6">{sourceLang.charAt(0).toUpperCase() + sourceLang.slice(1)}</th>
            <th className="col-5">{targetLang.charAt(0).toUpperCase() + targetLang.slice(1)}</th>
            <th className="col-1"></th>
          </tr>
          </thead>
          <tbody>
          {
            filteredTranslations.map((translation, id) => (
              <tr key={id} className="d-flex">
                <td className="col-6">{translation.source} <Voice text={translation.source} lang="en-US"/></td>
                <td className="col-5">{translation.target} <Voice text={translation.target} lang="fr-FR"/></td>
                <td className="col-1 text-right">
                  <span onClick={this.delete.bind(this, translation)} style={{cursor: 'pointer'}}>
                    <i className="fas fa-trash-alt fa-2x" style={{color: 'tomato'}} />
                  </span>
                </td>
              </tr>))
          }
          </tbody>
        </table>
      </Fragment>
    </Fragment>
  }
}