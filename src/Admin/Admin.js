import React, {Component, Fragment} from 'react';
import './Admin.css'
import {addTranslations, getAllTranslationsBy, deleteTranslations} from '../translations/firebase';
import {Loader} from '../Loader/Loader';

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
    }
  }

  handleChangeSourceValue(event) {
    this.setState({sourceValue: event.target.value});
  }

  handleChangeTargetValue(event) {
    this.setState({targetValue: event.target.value});
  }

  updateTranslations() {
    return getAllTranslationsBy(this.props.source, this.props.target)
      .then(translations => this.setState({translations}))
      .then(_ => this.setState({status: ADDING}));
  }

  componentDidMount() {
    this.updateTranslations();
  }

  delete({source, target}) {
    this.setState({status: FETCHING});
    deleteTranslations(this.props.source, this.props.target, source, target)
      .then(this.updateTranslations.bind(this));
  }

  add() {
    this.setState({
      status: SAVING,
    });
    addTranslations(this.props.source, this.props.target, this.state.sourceValue, this.state.targetValue)
      .then(_ => {
        this.setState({
          sourceValue: '',
          targetValue: '',
        })
      })
      .then(this.updateTranslations.bind(this));
  }

  render() {
    const {source, target, quit} = this.props;
    const {sourceValue, targetValue, status, translations} = this.state;

    if(status === FETCHING) {
      return <Loader />
    }

    return <Fragment>
      <div className="row justify-content-center pb-2">
        <button className="btn btn-primary" type="button" onClick={quit}>
          <i className="fas fa-chevron-left"/> Back to lobby
        </button>
      </div>
      <form>
        <div className="form-row">
          <div className="col-md-6 col-12">
            <input type="text"
                   value={sourceValue}
                   onChange={this.handleChangeSourceValue.bind(this)}
                   className="form-control"
                   placeholder={source.charAt(0).toUpperCase() + source.slice(1)}/>
          </div>
          <div className="col-md-6 col-12 pt-2 pt-md-0">
            <input type="text"
                   value={targetValue}
                   onChange={this.handleChangeTargetValue.bind(this)}
                   className="form-control"
                   placeholder={target.charAt(0).toUpperCase() + target.slice(1)}/>
          </div>
        </div>
        <div className="form-row pt-2">
          <div className="col m-auto col-12 col-sm-4">
            <button className="btn btn-success btn-block" type="submit" onClick={this.add.bind(this)}
                    disabled={status === SAVING}>
              <i className="fas fa-plus-circle"/> Add
            </button>
          </div>
        </div>

        <h2 className="text-center">{translations.length} translations available</h2>
        <table className="table">
          <thead>
          <tr className="d-flex">
            <th className="col-6">{source.charAt(0).toUpperCase() + source.slice(1)}</th>
            <th className="col-5">{target.charAt(0).toUpperCase() + target.slice(1)}</th>
            <th className="col-1"></th>
          </tr>
          </thead>
          <tbody>
          {
            translations.map((translation, id) => (
              <tr key={id} className="d-flex">
                <td className="col-6">{translation.source}</td>
                <td className="col-5">{translation.target}</td>
                <td className="col-1 text-right">
                  <span onClick={this.delete.bind(this, translation)} style={{cursor: 'pointer'}}>
                    <i className="fas fa-trash-alt fa-2x" style={{color: 'tomato'}} />
                  </span>
                </td>
              </tr>))
          }
          </tbody>
        </table>
      </form>
    </Fragment>
  }
}