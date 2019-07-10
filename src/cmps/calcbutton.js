import React from 'react';

const CalcButton = props => {
  return(
    <button id={props.id} className="calc_but" onClick={() => props.handler(props.value)}>
      {props.value}
    </button>
  );
}

export default CalcButton;