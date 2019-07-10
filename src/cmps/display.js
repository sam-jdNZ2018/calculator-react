import React from 'react';

class Display extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div id="display_cont">
        <input id="eq_display" type="text" value={this.props.eq} readOnly />
        <input id="display" type="text" value={this.props.curr} readOnly />
      </div>
    );
  }
}

export default Display;