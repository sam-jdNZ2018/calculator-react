import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import Calculator from './cmps/calculator';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Calculator />, document.getElementById('main'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
