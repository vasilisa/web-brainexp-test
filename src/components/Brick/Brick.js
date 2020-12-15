import React from 'react';
import './Brick.css';


class Brick extends React.Component {
  render() {
    
    const animation_property = this.props.animation ? 'activate' : 'reset';
    const animation_popup    = this.props.animation ? 'activate' : 'reset';
     
    // const selected           = (this.props.noFeedback==='') ? 'selected' : 'notSelected'
    const selected           = (this.props.symbolHighlight ==='') ? 'selected' : 'notSelected'

    if (this.props.showFeedback ===true){
       return (      
      <div className="container">
      <img className={"symbol " + " " + selected + " " + animation_property} src={this.props.symbol} alt='symbol' onClick={() => this.props.symbolClicked()}/>
      <div className={"square"  + this.props.noFeedback + " " + animation_property } alt='feedback'>{this.props.feedback}</div>   
      </div>
    );

    }
    else if (this.props.showConf === false){
      return (      
      <div className="container">
      <img className={"symbol " + " " + selected + " " + animation_property} src={this.props.symbol} alt='symbol' onClick={() => this.props.symbolClicked()}/>
      </div>
      ); 
    
    }
    else {
    return (      
      <div className="container">
      <img className={"symbol " + " " + selected} src={this.props.symbol} alt='symbol' onClick={() => this.props.symbolClicked()}/>
      </div>
    );
  }
  }
}

export default Brick;

/*
   <div className={"square" + this.props.noFeedback} alt='feedback'>{this.props.feedback}</div>   
*/ 