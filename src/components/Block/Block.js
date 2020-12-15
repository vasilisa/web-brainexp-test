import React from 'react';
import { Button } from 'react-bootstrap';
import {withRouter} from 'react-router-dom';
import { API_URL } from '../../config';
import { handleResponse } from '../helpers';

// import { CSSTransitionGroup } from 'react-transition-group';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup'; // for newer version 


import Score from '../Score/Score';
import quizQuestions from './quiz_questions';



import './Block.css'


class Block extends React.Component {
  constructor(props){
    super(props);
    const participant_info = this.props.location.state.participant_info

    // console.log('Block startQuiz:',this.props.location.state.startQuiz)

    
    const block_info = {

      position      : [],
      reward_1      : [],
      reward_2      : [],
      block_feedback: '',  
      trial_numb    : 0,
      block_number  : '', 
      block_type    : '',
      block_learning : '',
      TotalTrial    : ''
    }

    this.state = {
      participant_info      : participant_info,
      block_info            : block_info,
      newblock_frame        : this.props.location.state.newblock_frame,
      pool_symbols          : {},
      score                 : -1,
      load_bonus            : false, 
      currentInstructionText: 1, // this is for the transition between the instructions screens without changing the block number
      readyToProceed        : false, 
      startQuiz             : this.props.location.state.startQuiz,  // do the quiz at the end of the second training block before the main task starts       
      quizQuestions         : quizQuestions, 
      }

    this.fetchBlock.bind(this);
    this.fetchSymbols.bind(this);
    this.redirectToScore.bind(this); 
    this.redirectToIgtask.bind(this);
    this.redirectToQuiz.bind(this);
     
    this._isMounted = false;
    this._handleGoBack.bind(this);
    this.handleInstructionsLocal = this.handleInstructionsLocal.bind(this) 

    // this.hydrateStateWithLocalStorage = this.hydrateStateWithLocalStorage.bind(this) 


  }

  // Transition between the instruction screens without changing the block    
  handleInstructionsLocal(event){
    var curText     = this.state.currentInstructionText;
    var whichButton = event.currentTarget.id;
    
    if(whichButton==="left" && curText > 1){
      this.setState({currentInstructionText: curText-1});
      }
    else if(whichButton==="right" && curText < 3){
      
    this.setState({currentInstructionText: curText+1});
    }

    if(whichButton==="right" && curText === 2){
      this.setState({readyToProceed: true});
    }
  }


  redirectToTarget () {
      // console.log(this.state.pool_symbols)
      if((this.state.participant_info.block_number <= (this.state.participant_info.TotalBlock)))
          {           
          if (this.state.newblock_frame){
          this.setState({newblock_frame : false})
          this.props.history.push({
           pathname: `/Board`,
           state: {participant_info: this.state.participant_info,
                   block_info      : this.state.block_info,
                   pool_symbols    : this.state.pool_symbols
                 }
          })}
          else
          {
            if (this._isMounted)
            {
              
              // console.log(this.state.participant_info.block_number)
              const newblocknumber = this.state.participant_info.block_number + 1
              // console.log(newblocknumber)

              if (newblocknumber === this.state.participant_info.TotalBlock+1){ 
                console.log('Fetching the score')
                this.fetchScore()
                }

              else {
                this.fetchBlock(this.state.participant_info.game_id,newblocknumber+1) //this.state.participant_info.block_number
              
                this.fetchSymbols(this.state.participant_info.game_id,newblocknumber+1); 
              
                this.setState({newblock_frame : true, participant_info : {...this.state.participant_info, block_number:newblocknumber},}) // what gets updated 
              }
            }
          }
        }
      }
    
  // When the task is over 
  fetchScore() {
  if (this._isMounted) {

    fetch(`${API_URL}/participants_data_banditgame/score/`+ this.state.participant_info.participant_id +'/'+ this.state.participant_info.game_id +'/'+this.state.participant_info.prolific_id)
            .then(handleResponse)
            .then((data) => {
              const bonus = data['bonus']
              // console.log(bonus)

              this.setState({
                  score : bonus,
                  loading : false,
                  load_bonus: true,
                  newblock_frame : true,
                  participant_info : {...this.state.participant_info, block_number:this.state.participant_info.TotalBlock+1}
                });
            })
            .catch((error) => {
                this.setState({ error : error.errorMessage, loading: false, load_bonus: false });
                 });
}
}

redirectToQuiz() {

if  (this.state.startQuiz === true && this._isMounted===true){
  // console.log('Starting the quiz') 
  this.props.history.push({
           pathname: `/QuizGame`,
           state: {quizQuestions: this.state.quizQuestions,
                  participant_info: this.state.participant_info
                 }
          })
}

else if  (this.state.startQuiz === false){
    this.redirectToTarget()
 }
}

redirectToScore() {
if (this.state.load_bonus === false) {
  this.fetchScore() 
}
  
else if  (this.state.load_bonus === true){
   return (
        <Score
          score      = {this.state.score}  
          onClicked  = {this.redirectToIgtask} //callback
        />
      );}
 }

redirectToIgtask = () => {

  // Post the bonus amount together with the prolific id and participant ids in the ParticipantsDataBonus table: 
  let body = { 
              'participant_id'  : this.state.participant_info.participant_id,
              'prolific_id'     : this.state.participant_info.prolific_id,
              'date_time'       : this.state.participant_info.date_time,
              'bonus'           : this.state.score}
              
    // console.log(body) 
    fetch(`${API_URL}/participants_data_bonus/create/`+this.state.participant_info.participant_id +'/'+this.state.participant_info.prolific_id, {
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
      'log_type'     : 'banditgame' 
    }
    

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
    sessionStorage.removeItem('cashed') // clear cash before the next game 
      
    this.props.history.push({
      pathname: `/IgtInstructions`,
      state: {participant_info: this.state.participant_info, newblock_frame: true} // to verify what is actually imported to a new page and what you need 
    })
  } 
  componentDidMount() {  
  this._isMounted = true;
  document.body.style.background= '#fff';   
  this._isMounted && this.fetchBlock(this.state.participant_info.game_id,this.state.participant_info.block_number+1);
  this._isMounted && this.fetchSymbols(this.state.participant_info.game_id,this.state.participant_info.block_number+1);
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


  fetchSymbols(game_id_,block_number_) {
    fetch(`${API_URL}/games/`+game_id_+'/'+block_number_) 
      .then(handleResponse)
      .then((data) => {

        const required_pool_of_symbols = Object.keys(data['symbols']).map((key, index) => (require('../../images/' + data['symbols'][key])))

          this.setState({
            pool_symbols : required_pool_of_symbols,
            loading      : false 

          });
        })

      .catch((error) => {
        this.setState({ error : error.errorMessage, loading: false });
         });
       }

// This is to get the data for a specific block from the Back 
  async fetchBlock(game_id_,block_number_) {
    
    this.setState({ loading: true });
    const fetchResult = fetch(`${API_URL}/game_blocks/`+game_id_+'/'+block_number_)
      .then(handleResponse)
      .then((data) => {

        const block_info = {
          block_number   : data.block_number,
          block_feedback : data.block_feedback, 
          block_type     : data.block_type,
          block_learning : data.block_learning,
          reward_1       : Object.keys(data['reward_1']).map((key, index) => (data['reward_1'][key])),
          reward_2       : Object.keys(data['reward_2']).map((key, index) => (data['reward_2'][key])),
          th_reward_1    : Object.keys(data['th_reward_1']).map((key, index) => (data['th_reward_1'][key])),
          th_reward_2    : Object.keys(data['th_reward_2']).map((key, index) => (data['th_reward_2'][key])),
          position       : Object.keys(data['position']).map((key, index) => (data['position'][key])),
          trial_numb     : 0,
          TotalTrial     : Object.keys(data['reward_1']).length  // 1 for THIS IS FOR THE TEST ONLY 
        }
      
        this.setState({
          block_info: block_info,
        });
        // console.log(this.state.block_info)
      })
        .catch((error) => {
          this.setState({ error : error.errorMessage, loading: false });
      });
    const response = await fetchResult;
    return response
  }


render()
  { 
    let text
    if ((this.state.participant_info.block_number === 0) && (this.state.newblock_frame) && (this.state.block_info.block_feedback==="1"))
    { 
      text = <div className='textbox'> <p>This is a <span className="bold">training</span> block. You will play two <span className = "bold">winning</span> slot machines. You will only see points of the <span className = "bold">chosen</span> slot machine.</p> 
              <div className="translate"/>
                <img className="introsymbol"  src={require('../../images/symbol_shape_0_grate_None_color_3.png')} alt='introsymbol' /> 
                <img className="introsymbol"  src={require('../../images/symbol_shape_2_grate_None_color_0.png')} alt='introsymbol' /> 
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
          <Button className="buttonInstructionsBlock" onClick={()=>this.redirectToTarget()}>
            &#8594;
          </Button>
        </center>
      </div>
      </center> 
      </div>
      </CSSTransitionGroup>);
    } 


    else if ((this.state.participant_info.block_number===1) && (this.state.newblock_frame) && (this.state.block_info.block_learning==="2")) 
    { 

      if (this.state.currentInstructionText===1) {
        text = <div className='textbox'> 
                <p>Did you notice that the most rewarding colored shape was not the same throughout the session?</p>
                <p>At the beginning it was <span className="bold red"> the red circle </span> but in the middle of the session it changed,</p> 
                <p>and <span className="bold blue">the blue star </span> became more rewarding?!</p>
                <p>It is important that you track these changes !</p>
                <p>It is also important to track outcomes <span className='bold italic'>in time</span> and avoid switching too much</p>
                <p>because even a good shape can occasionally give few points !</p>
              </div>
              }

        else if (this.state.currentInstructionText===2) {
             text = <div className='textbox'> 
              <p>Let's do another training session. This time, you will play against two <span className="bold">loosing</span> slot machines</p>
              <p>On each trial you will see how many points you lost when choosing one of the two slot machines</p>
              <p>Try to avoid losing as many points as possible!</p> 
              <br></br>
              <p>After the training we will ask you to do a short <span className="bold">quiz</span>!</p>
              
                <div className="translate"/>
                <img className="introsymbol"  src={require('../../images/symbol_shape_1_grate_None_color_2.png')} alt='introsymbol'/> 
                <img className="introsymbol"  src={require('../../images/symbol_shape_3_grate_None_color_1.png')} alt='introsymbol'/>
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
        <div>
        <center>

        <div>
            {text}           
        </div> 
          

        <div className="instructionsButtonContainer">

          
          {this.state.currentInstructionText===2 ?
            <Button id="start" className="buttonInstructionsBlock" onClick={()=>this.redirectToTarget()}>
              START
            </Button>
            :
            <div>
            <Button id="left" className="buttonInstructions" onClick={this.handleInstructionsLocal}> 
              <span className="bold">&#8592;</span>
            </Button>
            <Button id="right" className="buttonInstructions" onClick={this.handleInstructionsLocal}> 
              <span className="bold">&#8594;</span>
            </Button>
            </div>
          }
          
          </div>
          </center>
          </div>
      </CSSTransitionGroup>);
      }

    // Starting the quiz after the training: 
    else if ((this.state.participant_info.block_number===1) && (this.state.newblock_frame===false) && (this.state.startQuiz===true)) 
    {
       text = <div className='textbox'><p> You finished the training!</p>
                  <p></p>
                  <p> It's time for a short quiz now!</p>
                  <p>If you fail to answer correctly <span className="bold">all quiz questions</span> you will have to redo the quiz again before starting the game</p>
                  <p>Please, do pay attention!</p> 
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
            <Button className="buttonInstructionsBlock" onClick={()=>this.redirectToQuiz()}>
            START QUIZ
            </Button>
          </center>
        </div>
        </center>
        </div>
        </CSSTransitionGroup>);


    }
    
    // Starting the real task : should be conditional on the quiz responses to add here 
    else if ((this.state.participant_info.block_number===1) && (this.state.newblock_frame===false) && (this.state.startQuiz===false))
    {
      text = <div className='textbox'>
                  <p> Let's start the task now! </p>
                  <p> Finding the most rewarding or the least loosing slot machine will be harder than during the training, so pay attention!</p>
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
            <Button className="buttonInstructionsBlock" onClick={()=>this.redirectToTarget()}>
            &#8594;
            </Button>
          </center>
        </div>
        </center>
        </div>
        </CSSTransitionGroup>);
    }
    else if (
      (this.state.participant_info.block_number===this.state.participant_info.TotalBlock+1) && (this.state.load_bonus===true)
     
      )
    {
      return(

          <div>{this.redirectToScore()}</div>       
        )
    }

    else
    {
      const feedback_type_text = (this.state.block_info.block_feedback==="1") ? 'PARTIAL' : 'COMPLETE';
      const learning_type_text = (this.state.block_info.block_learning==="1") ? 'WINNING' : 'LOOSING';
      
      const end_of_block_text  = (this.state.block_info.block_type==="training") ? 'End of training block': 'End of block ' + (this.state.participant_info.block_number-1)
      
      if (this.state.newblock_frame) 
        {
          text = <div><p>The next block is <span className="bold">{learning_type_text}</span> feedback block!</p></div>
        }
      else
        { 
          text = <div><p>{end_of_block_text}</p></div> //'End of block ' + (this.state.participant_info.block_number+1)
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
      <div className="restarttraining">
        {text}           
      </div>
        <center>
        <Button className="buttonInstructionStart" onClick={()=>this.redirectToTarget()}>
          &#8594;
        </Button>
        </center>
    </center>
    </div>
    </CSSTransitionGroup>);
    }    
  }

}

export default withRouter(Block);