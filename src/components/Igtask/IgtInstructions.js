import React from 'react';
import {withRouter} from 'react-router-dom';
import { Button } from 'react-bootstrap';
import queryString from 'query-string';


import { API_URL } from '../../config';
import { handleResponse } from '../helpers';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup'; // for newer version 

import './IgtInstructions.css';


/*
Instruction component is created when the particpant accepts terms and conditions and proceeds to the experiment. 
It loads the participant id, and the block configurations that will be played during the game. 
*/

// Specify a SURVEY LIST HERE FOR SIMPLICITY 
// IMPORTANT: Has to match the import names in the Survey.js !!! 

const survey_list = [
'ocir', // OCD
'iq',   // IQ, 
]


class IgtInstructions extends React.Component {
    constructor(props) {
        super(props);

        const participant_info = this.props.location.state.participant_info
        var current_time_      = new Date().toLocaleString(); // start of the IgtTask 

        this.state = {
            prolific_id : participant_info.prolific_id,    
            participant_id : participant_info.participant_id,
            survey_list: survey_list,
            date_time: participant_info.date_time, 
            block_number: 0, 
            survey_list: survey_list, 
            TotalRun: 3, 
            block_number_survey: 0, 
            run: 1,
            game: 1,   
            newblock_frame : true, 
            readyToProceed: false,
            beginexp: current_time_, 
            currentInstructionText: 1,
            score: 0, 
            totalscore:0

        }

    this.handleInstructionsLocal = this.handleInstructionsLocal.bind(this) // bind the method to avoid error on frames collapsed
    }; 

    // Mount the component to call the BACKEND and GET the information
    componentDidMount() {
    document.body.style.background = "fff";  
    } 
    
    // Transition between the instruction screens   
    handleInstructionsLocal(event){
        var curText     = this.state.currentInstructionText;
        var whichButton = event.currentTarget.id;
    
        if(whichButton==="left" && curText > 1){
        this.setState({currentInstructionText: curText-1});
        }
        else if(whichButton==="right" && curText < 4){ // this only for the 1st part of instructions right now: to be changed 
      
        this.setState({currentInstructionText: curText+1});
        }
        if(whichButton==="right" && curText === 3){
        this.setState({readyToProceed: true});
        }
    }

    // change the router type to pass the props to the child component 
    redirectToTarget = () => {

    this.props.history.push({
       pathname: `/IgtBlock`,  
       state: {participant_info: this.state, newblock_frame:this.state.newblock_frame,startQuiz:false} 
     })
    }


    render() {
        let mytext
        if (this.state.currentInstructionText===1) {
            mytext = <div className='textbox'> <p></p><p>In this game you will see <span className="bold">25 boxes</span> and each of these boxes is one of <span className="bold">2 colours</span>.</p>
            <p>For example, you might see <span className="yellow bold">yellow</span>  and <span className="blue bold">blue</span> boxes.</p>
           
            <p> At the beginning all boxes are covered.</p>

            <p><span className='bold'>To open the box, you need to click on it </span>, and it will reveal its colour.</p>
            <p><span className='bold'>Your goal is to choose the colour that you think is more plentiful across all boxes</span>.</p>
            <p>If you choose a correct colour you will earn <span className="bold">100 points</span>, otherwise you will lose <span className="bold">-100 points</span>.</p>
            <br></br>
            <p>At the end of the game you can win up to <span className="bold">£0.50 as a bonus</span> based on your performance.</p>
            </div> 
        }

        else if (this.state.currentInstructionText===2) {
        mytext = <div className='textbox'> <p></p><p>Before you make your choice, you can <span className="bold"> open as many boxes as you want until you feel certain enough</span></p>
                <p>Once you feel certain enough, you can choose a colour by clicking on the coloured boxes below.</p>
                <div>    
                    <img className="instructimg"  src={require('../../images/IGT_inst1.png')} alt='instructimg'/> 
                </div>
                </div>
            }
        else if (this.state.currentInstructionText===3) {
        mytext = <div className='textbox'> <p></p><p>Additionally, we will ask you about how confident you are about your choice.</p>
                <p></p>
                <div>    
                    <img className="instructimgconf"  src={require('../../images/conf_intro.png')} alt='instructimgconf'/> 
                </div>
                <p></p>
                <p><span className = 'bold'>Very uncertain</span> indicates that you are <span className = 'bold'>very unsure</span> that you chose the colour which is <span className='bold'> the most plentiful</span>.</p>
                <p><span className = 'bold'>Very certain</span>  indicates that you are <span className = 'bold'>very sure</span> that you chose the colour which is <span className='bold'> the most plentiful</span>.</p> 
                <p>Do your best to rate your confidence accurately!</p> 
                <p>For example if you are somewhat uncertain that you chose the most plentiful colour, slide your answer to the left.</p>
                <p>Alternatively if you are more certain that you chose the most plentiful colour, slide your answer to the right.</p>
                <p>Double-click the mouse or tap the circle on the slider to confirm your rating.</p> 
                <p>Don't overthink your ratings too much!</p>
                <p>Be sure to make use of the <span className='bold'>full length</span> of the scale throughout the game!</p>
  
                </div>
            }

        else if (this.state.currentInstructionText===4) {
        mytext = <div className='textbox'> <p></p><p>Let's do the short training first!</p>
                <p></p>
                <p>At the end of the training we will ask you to complete a short quiz.</p>
                <p>If you fail to answer <span className='bold'>any of the questions</span> correctly you will have to go through the instructions again and redo the quiz!</p>
                </div>
            }
    
        return (
            <CSSTransitionGroup
            className="container"
            component="div"
            transitionName="fade"
            transitionEnterTimeout={800}
            transitionLeaveTimeout={500}
            transitionAppear
            transitionAppearTimeout={500}>
            <div className="center translate">
            <div className="InstructText">
            <center> 
            <p className='title'><span className="bold">INSTRUCTIONS</span></p>
            </center>
                <center> 
                <div className="instructionsButtonContainer">

                    {this.state.currentInstructionText > 1 ? // id helps get which button was clicked to handle the 

                        <Button id="left" className="buttonInstructions" onClick={this.handleInstructionsLocal}> 
                            <span className="bold">&#8592;</span>
                        </Button>
                        :
                        <Button id="left" className="buttonInstructionsHidden">
                            <span className="bold">&#8592;</span>
                        </Button>
                    }

                    {this.state.currentInstructionText < 4 ?
                        <Button id="right" className="buttonInstructions" onClick={this.handleInstructionsLocal}>
                            <span className="bold">&#8594;</span>
                        </Button>
                        :
                        <Button id="right" className="buttonInstructionsHidden">
                            <span className="bold">&#8594;</span>
                        </Button>
                    }

                    <div>
                    <center>
                        {mytext}
                    </center>
                    </div>
                    {this.state.readyToProceed ?
                    <div>
                    <center>
                        <label className='textbox'> Let's try it first!</label><br/>
                        <Button className="buttonInstructionStart" onClick={()=>this.redirectToTarget()}>
                            <span className="bold">START</span>
                        </Button>
                    </center>
                    
                    </div>
                    : null}

            </div>
        </center>
        </div>
        </div>
        </CSSTransitionGroup>
        ) 
    }
}

export default withRouter(IgtInstructions);
