import React from 'react';

export class ProgressBar extends React.Component {
  constructor(props) {
    super(props);
  }
  render () {
    return (
      <div style={{
        position: 'relative',
        height: '4px',
        width: `calc(${this.props.width || '100%'} - 15px)`,
        backgroundColor: '#c9bbdc',
        borderRadius: '5px',
      }}>
        {/* Point */}      
        <div style={{
          position: 'absolute',
          left: `${this.props.progressPercent}`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          bottom: '10px',
          height: '8px',
          width: '8px',
          backgroundColor: '#7364a9',
          borderRadius: '50%',
          }} />
        {/* Progress */}
        <div style={{        
          position: 'absolute',
          left: '0',
          top: '0',
          bottom: '10px',
          height: 'inherit',
          width: `${this.props.progressPercent}`,
          backgroundColor: '#7364a9',
          borderRadius: '5px',
        }}/>
      </div>
    );
  }
}
