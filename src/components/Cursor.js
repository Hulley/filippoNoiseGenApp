import React from 'react';

require('../cursor.css')

export class Cursor extends React.Component {
    render(){
        return (
          <div id="cursor" style={{
            zIndex: 1,
            position: 'absolute',
            opacity: 0,
            left: `${this.props.cursorPos.x}`,
            top: `${this.props.cursorPos.y}`,
            width: '20px',
            height: '20px',
            marginLeft: '-10px',
            marginTop: '-10px'
          }}>
            <div className="inner one"></div>
            <div className="inner two"></div>
            <div className="inner three" style={{
              animation: `rotate-three ${this.props.spinTime}s linear infinite`
            }}>
            </div>
          </div>
        );
    };
};