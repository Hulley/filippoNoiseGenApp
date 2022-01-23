import React from 'react';

export class HelpDialogue extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        helpShowing: false,
      };
    }
    
    toggleShowHelp(){
        if(this.state.helpShowing){
          this.setState({helpShowing: false});
        //   console.info("hide help");
          setTimeout(()=>console.log(document.activeElement),2000);
        } else {
          this.setState({helpShowing: true});
        //   console.info("show help");     
        }
    }

    render(){
        return (
            <div id="helpDialogue" style={{
                opacity: 0,
                padding: '.3rem',
                background: 'rgba(0,0,0,.7)',
                fontSize: '.6rem',
                position: 'absolute',
                right: '1rem',
                bottom: '1rem',
                textAlign: 'left',
            }}>
                {
                    !this.state.helpShowing && 
                    <div>h - show help / controls</div>
                }
                {
                    this.state.helpShowing && 
                    <>
                    <div>p - toggle play / pause</div>
                    <div>x - lock / unlock cursor position</div>
                    <div>h - toggle show / hide help</div>
                    </>
                }
            </div>
        );
    };
};