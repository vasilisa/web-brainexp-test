import React from 'react';
import { Button } from 'react-bootstrap';
import {withRouter} from 'react-router-dom';
import { API_URL } from '../../config';
import { handleResponse } from '../helpers';

// import Score from '../Score/Score'; // to be modified to compute the bonus and score at the end of the task 
import quizQuestions from './Igt_quiz_questions';

import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup'; // for newer version 

import './IgtBlock.css';


class IgtBlock extends React.Component {
  constructor(props){
    super(props);

    const participant_info = this.props.location.state.participant_info // information you receive from router component (e.g IgtBoard)
    
    const quizrun_  = (this.props.location.state.participant_info.run===2) ? 2 : 1
  

    this.state = {
      participant_info      : participant_info,
      newblock_frame        : this.props.location.state.newblock_frame,
      currentInstructionText: 1, // this is for the transition between the instructions screens without changing the block number
      readyToProceed        : false,
      score: this.props.location.state.score,
      totalscore: participant_info.totalscore, 
      startQuiz             : this.props.location.state.startQuiz, // this.props.location.state.startQuiz,  // do the quiz at the end of the training and before the instructions for the second game round 
      bonus                 : '', 
      quizQuestions_total   : quizQuestions,
      quizrun               : quizrun_, 
      block_number_survey: 0 
      }

    this.redirectToSurvey.bind(this);
    this.computeBonus.bind(this); 
     
    this._isMounted = false;
    this._handleGoBack.bind(this);
    
     
  }

  redirectToTarget () {
      if((this.state.participant_info.run <= (this.state.participant_info.TotalRun)))
          {           
          if (this.state.newblock_frame){
          this.setState({newblock_frame : false})
          this.props.history.push({
           pathname: `/IgtBoard`,
           state: {
              participant_info: this.state.participant_info,
              startQuiz: this.state.startQuiz
            }
          })}
          else
          {
            if (this._isMounted && this.state.startQuiz==false) 
            
            {
              
              const newblocknumber = this.state.participant_info.run + 1
              
              
              if (newblocknumber === this.state.participant_info.TotalRun+1 && this.state.readyToProceed===false){ 
                this.setState({participant_info : {...this.state.participant_info, run:newblocknumber},}) // what gets updated 

                this.computeBonus()
                }

              else if (newblocknumber === this.state.participant_info.TotalRun+1 && this.state.readyToProceed===true){ 
                
                    this.setState({newblock_frame: true})
                  }
              else {
                
                this.setState({newblock_frame: true, participant_info : {...this.state.participant_info, run:newblocknumber},}) // what gets updated 
              }
            }
            else if (this._isMounted && this.state.startQuiz==true)
              
              {
                const newblocknumber = this.state.participant_info.run // DO NOT UPDATE THE RUN HERE 
          
                this.setState({newblock_frame: true, participant_info : {...this.state.participant_info, run:newblocknumber},}) // what gets updated 

              }

          }
        }
    }
    
  
redirectToSurvey = () => {

    // Save the bonus info 

      let body     = {'bonus' : this.state.bonus}  

       fetch(`${API_URL}/igtaskbonus/`+this.state.participant_info.participant_id +'/'+this.state.participant_info.prolific_id, {
       method: 'POST',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(body)
     })

        // Extract data from the localStorage and push them to the DB as well
    let cashed_ = {}
    if (sessionStorage.hasOwnProperty('cashed')) {
        cashed_ = sessionStorage.getItem('cashed');

        try {
          cashed_ = JSON.parse(cashed_);
          // console.log('parsed cash',cashed_)
        } catch (e) {
          console.log('Cannot parse cashed', cashed_)
        }
    }

    // Push cashed data to the DB
    var date_time_end = new Date().toLocaleString();

    let body_cashed = {
      'log'          : cashed_,  // this.state.cashed, 
      'date_time'    : this.state.participant_info.date_time, 
      'date_time_end': date_time_end, 
      'log_type'     : 'igtgame' 
    }
    
    console.log('body_cashed', body_cashed)

    try {

    fetch(`${API_URL}/attempts_followup/save_followup/`+ this.state.participant_info.participant_id + `/` + this.state.participant_info.prolific_id, {
       method: 'POST',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(body_cashed)
    })
    }
    catch(e) {
      console.log('cannot post cashed data: data would be lost')
    }

    // console.log('Clearing cashed')
    sessionStorage.removeItem('cashed')


    this.props.history.push({
      pathname: `/Survey`,
      state: {participant_info: this.state.participant_info, newblock_frame: true} // to verify what is actually imported to a new page and what you need 
    })
  }

computeBonus() {

    var bonus_ = (this.state.totalscore/5100)*0.50
    if (bonus_< 0.0){
        bonus_ = 0.0
    }
    else {
      bonus_ = Number((bonus_).toFixed(2))
    }
    // console.log('Bonus', bonus_)
    
    this.setState({
      bonus: bonus_,
      readyToProceed: true})
  }


  componentDidMount() {  
  this._isMounted = true;
  document.body.style.background= '#fff';   
  window.history.pushState(window.state, null, window.location.href);
  window.addEventListener('popstate', e => this._handleGoBack(e));
  window.onbeforeunload = this._handleRefresh
  }

  _handleRefresh(evt){
    return false // error message when refresh occurs
  }

  _handleGoBack(event){
    window.history.go(1);
  }

  componentWillUnmount()
  {
   this._isMounted = false;
  }  


redirectToQuiz() {

if  (this.state.startQuiz === true && this._isMounted===true){


  if (this.state.quizrun===1) {
      // Select questions for quiz 1 
     var quizQuestions_ = this.state.quizQuestions_total.slice(0,5)
  }

  else {
      // Select questions for quiz 2 
      var quizQuestions_ = this.state.quizQuestions_total.slice(5,7)
  }

  
  this.props.history.push({
           pathname: `/IgtQuizGame`,
           state: {quizQuestions: quizQuestions_,
                  participant_info: this.state.participant_info,
                  quizrun: this.state.quizrun
                 }
          })
}

else if  (this.state.startQuiz === false){
    this.redirectToTarget()
 }
}


render()
  { 
    let text
    if ((this.state.participant_info.run === 1) && (this.state.newblock_frame))
    { 
      text = <div className='textbox'> <p>This is a practice round. Try to find which of the two colours is <span className="bold">more plentiful!</span></p> 
            </div>

    return (
      <CSSTransitionGroup
      className="container"
      component="div"
      transitionName="fade"
      transitionEnterTimeout={800}
      transitionLeaveTimeout={500}
      transitionAppear
      transitionAppearTimeout={500}>

      <div>
      <center> 
      <div className="instructionsButtonContainer">
        <div>
          {text}           
        </div> 
        <center>
          <Button className="buttonStart" onClick={()=>this.redirectToTarget()}>
            CONTINUE
          </Button>
        </center>
      </div>
      </center> 
      </div>
      </CSSTransitionGroup>);
    } 

    // Start the Full run 1 after the practice round 

    else if ((this.state.participant_info.run===1) && (this.state.newblock_frame===false) && (this.state.startQuiz===true)) 
      { 

       if (this.state.score===100) {
          var textscore = 'Well done! You got it!'
      }
      else {
          var textscore = 'Oops! but you got the idea!'
      }

      text = <div className='textbox'> 
        <p>{textscore}</p>
      </div>

      return (
          <CSSTransitionGroup
            className="container"
            component="div"
            transitionName="fade"
            transitionEnterTimeout={800}
            transitionLeaveTimeout={500}
            transitionAppear
            transitionAppearTimeout={500}>
        <div>
        <center>

        <div>
            {text}           
        </div> 
          
        <div className="instructionsButtonContainer">
          <Button id="start" className="buttonStart" onClick={()=>this.redirectToQuiz()}>
              START QUIZ
          </Button>
          </div>
          </center>
        </div>
      </CSSTransitionGroup>);
    }

 
    // Starting the real task : only of the quiz has been correct 
    else if ((this.state.participant_info.run===2) && (this.state.newblock_frame===true) && (this.state.startQuiz===false) || (this.state.participant_info.run===3) && (this.state.newblock_frame===true) && (this.state.startQuiz===false))
    {
      text = <div className='textbox'>
                <p>Let's start the real game now!</p>
                <p>You will play several rounds.</p>
                <p> Don't forget to report you confidence ratings accurately!</p>
              </div>
      return (
      <CSSTransitionGroup
      className="container"
      component="div"
      transitionName="fade"
      transitionEnterTimeout={800}
      transitionLeaveTimeout={500}
      transitionAppear
      transitionAppearTimeout={500}>
        <div>
        <center> 
        <div>
          <div className="restarttraining">
            {text}  <div className="translate"/>
          </div>
          <center>
            <Button className="buttonStart" onClick={()=>this.redirectToTarget()}>
            CONTINUE
            </Button>
          </center>
        </div>
        </center>
        </div>
        </CSSTransitionGroup>);
    }
  
    else if ((this.state.participant_info.run===2) && (this.state.newblock_frame===true) && (this.state.startQuiz===true))

      {
        text = <div className='textbox'> 
                <p>The next game is a little bit different.</p>
                <p><span className="bold">With every box you open, you will win 10 points less.</span></p>
                <p>This time, the wins start at 250 points.</p>
                <p>If you open, let's say 3 cards and you choose the correct colour, then you would win 220 points.</p>
                <p>However if you are wrong, you will <span className="bold">always lose 100 points</span>.</p>
                <p>You can see how much you can win on the score board on the top.</p>
                <p>You will play several rounds.</p>
                </div>
    
        return (
          <CSSTransitionGroup
            className="container"
            component="div"
            transitionName="fade"
            transitionEnterTimeout={800}
            transitionLeaveTimeout={500}
            transitionAppear
            transitionAppearTimeout={500}>
        <div>
        <center>

        <div>
            {text}           
        </div> 
        <div>    
            <img className="instructimg"  src={require('../../images/IGT_inst2.png')} alt='introsymbol'/> 
        </div>
        <div>
            <Button id="start" className="buttonStart" onClick={()=>this.redirectToQuiz()}>
              START
            </Button>
        </div>
          </center>
          </div>
      </CSSTransitionGroup>);
      }

    else if 
      (this.state.participant_info.run===this.state.participant_info.TotalRun+1 && this.state.readyToProceed===true)
      
    { 
      
      if (this.state.bonus>0.0) {
          var textscore = 'Well done! You won a bonus of £' + this.state.bonus +'!'
      }
      else {
          var textscore = 'Unfortunately you did not win a bonus this time.'
      }
      
      return(

      <CSSTransitionGroup
      className="container"
      component="div"
      transitionName="fade"
      transitionEnterTimeout={800}
      transitionLeaveTimeout={800}
      transitionAppear
      transitionAppearTimeout={800}>

      <div>
      <center>
      <div className="textbox">
        <p>You have finished the second game. Thank you!</p>
        <p></p>
        {textscore}
        <p></p>
        <p>Please, proceed to the last part of the study when ready.</p>
      </div>
        <center>
        <Button className="buttonStart" onClick={()=>this.redirectToSurvey()}>
          CONTINUE
        </Button>
        </center>
    </center>
    </div>
    </CSSTransitionGroup>);
      
    }

    else
    {
      
      if (this.state.newblock_frame && this.state.readyToProceed===false) 
        {
          text = <div><p>Try to find which of the two colours is <span className="bold">more plentiful!</span></p></div>
        }
      else if (this.state.newblock_frame===false && this.state.readyToProceed===false) // when newblockFrame is false 

        { 
          text = <div className='textbox'><p>Doing great!</p>
                <p>Your score: {this.state.score}</p>
                </div> //'End of block feedback 
        }
        return (
      <CSSTransitionGroup
      className="container"
      component="div"
      transitionName="fade"
      transitionEnterTimeout={800}
      transitionLeaveTimeout={800}
      transitionAppear
      transitionAppearTimeout={800}>

      <div>
      <center>
      <div className="textbox">
        {text}           
      </div>
        <center>
        <Button className="buttonStart" onClick={()=>this.redirectToTarget()}>
          CONTINUE
        </Button>
        </center>
    </center>
    </div>
    </CSSTransitionGroup>);
    }    
  }

}

export default withRouter(IgtBlock);
