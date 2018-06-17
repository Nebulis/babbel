import React from 'react';
import {LANGUAGES} from './LanguageContext';

const flagStyle = {
  width: '36px', height: '36px', border: '2px solid', borderRadius: '50%', cursor: 'pointer',
}

export const Languages = ({lang, changeLang, side = 'left'}) => {
  return (
    <div className={`dropdown drop${side}`}>
      <span
        className={`flag-icon flag-icon-${lang.code} flag-icon-squared`} id="dropdownMenuButton"
        data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"
        style={flagStyle}/>
      <div className="dropdown-menu App-languages-list" aria-labelledby="dropdownMenuButton">
        {
          Object.keys(LANGUAGES).map((lang, id) => <span key={id}
                                                             className={`flag-icon flag-icon-${LANGUAGES[lang].code} flag-icon-squared`}
                                                             style={flagStyle}
                                                             onClick={() => changeLang(LANGUAGES[lang])}/>)
        }
      </div>
    </div>
  )
}