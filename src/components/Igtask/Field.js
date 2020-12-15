import React from 'react';
import PropTypes from 'prop-types';

function Field(props) {
	let btn_class = props.clicked ? "fieldClicked" : "field";
    return(
      <button className={btn_class} disabled={props.end} onClick={() => props.onClick()} style={{backgroundColor: props.color}}>
      </button>
    )
}

Field.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default Field;


