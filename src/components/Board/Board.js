import React from 'react';
import './Board.css';
import Brick from '../Brick/Brick.js'
import ConfRate from '../Confidence/ConfRateNew.js'

import { API_URL } from '../../config';
// import { handleResponse } from '../helpers';
import {withRouter} from 'react-router-dom';

// import { CSSTransitionGroup } from 'react-transition-group';
// import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup'; // for newer version 

class Board extends React.Component {
  constructor(props){
    super(props);

    const participant_info = this.props.location.state.participant_info
    const block_info       = this.props.location.state.block_info
    const pool_symbols     = this.props.location.state.pool_symbols

    const current_symbols  = ['','']

    
    // Define intitial left and right symbols: 
    current_symbols[0]    = pool_symbols[block_info.position[0]-1] // 1 if on the right symbol 1, 0 if on the left 
    current_symbols[1]    = pool_symbols[2-block_info.position[0]] // 

    const showFeedback    = (this.props.location.state.participant_info.block_number===0) ? true : false
     
    this.state = {
      clickable        : true, // freezing when subject has chosen a symbol
      animation        : true, // relaunch fading animation after each trial
      feedback         : Array(2).fill(null),
      noFeedback       : ['null', 'null'],
      symbolHighlight  : ['null', 'null'],
      participant_info : participant_info,
      block_info       : block_info,        
      error            : '',
      chosen_rewards   : [],
      unchosen_rewards : [],
      block_perf       : 0.0,
      chosen_symbols   : [],
      chosen_positions : [],
      reaction_times   : [],
      current_symbols  : current_symbols,
      pool_symbols     : pool_symbols,  
      completed        : 'no', 
      showFeedback     : showFeedback,
      showConf         : false, 
      confidence       : [], 
      reaction_times_conf: [], 
      displayConf      :  false, 
      cashed           : {}, 
      confidence_init  : [], 
      reward_1         : [],  // observed rewards for option 1 
      reward_2         : [],  // observed rewards for option 2 


    };

    this.redirectToBlock.bind(this)
    this.handleConf.bind(this)
    this.handleClick.bind(this)
    
    var time_date_first               = new Date()
    this.prev_reaction_time_date      = time_date_first.getTime() // the beginning of the trial 
    this.hydrateStateWithLocalStorage = this.hydrateStateWithLocalStorage.bind(this) 
  };  

componentDidMount() {
    this.hydrateStateWithLocalStorage();
 }

  hydrateStateWithLocalStorage() {

      // if the key exists in localStorage
      if (sessionStorage.hasOwnProperty('cashed')) {
        let cashed_ = sessionStorage.getItem('cashed');
        // console.log(cashed_);

        try {
          cashed_ = JSON.parse(cashed_);
          this.setState({'cashed': cashed_ });
        } catch (e) {
          // handle empty string
          this.setState({'cashed': cashed_ });
        }

      }
   // console.log('retreived cash', this.state.cashed)
    }
  
  renderBrick(i) {
    return (
      <Brick
        symbol          = {this.state.current_symbols[i]}
        feedback        = {this.state.feedback[i]}
        animation       = {this.state.animation}
        noFeedback      = {this.state.noFeedback[i]}
        symbolHighlight = {this.state.symbolHighlight[i]}
        symbolClicked   = {() => this.handleClick(i)}
        showFeedback    = {this.state.showFeedback}
        showConf        = {this.state.showConf}
        
      />
    );
  }


  renderConf() {

    if (this.state.showConf === true && this.state.displayConf===true) { // adapt later && this.state.participant_info.block_number>0
        return(
          <ConfRate
            confClicked = {this.handleConf.bind(this)} // you have to bind here in order to have the state defined wihin the handleConf and also receives the values from the child 
          />)
        ;}
    else {
      return(null);}
   }

// let split handleClick in 2 parts: 1 will take care defining the choice and feedback after the click 
// second one about displaying the feedback and passing to the next trial once confidence rating is given 
  handleConf(conf_value,rt_conf,conf_init){ // receives the result from the child component on the call  

    // console.log('Confidence value is:',conf_value) 
    // console.log('Reaction times for confidence is:',rt_conf) 
    
    
    let confidence      = this.state.confidence; 
    let rt_confidence   = this.state.reaction_times_conf; 
    let confidence_init = this.state.confidence_init;

    confidence.push(conf_value)
    rt_confidence.push(rt_conf)
    confidence_init.push(conf_init)

    this.setState({
      showFeedback: true, 
      animation: false, // verify
      showConf: false,
      confidence: confidence, 
      reaction_times_conf: rt_confidence,
      confidence_init: confidence_init, 
      

    })


    // update symbol without Mutation
    const newcount     = this.state.block_info.trial_numb + 1
    const end_of_block = (newcount === this.state.block_info.TotalTrial ? true : false ) ? true : false 
    
    // new symbols
    const current_symbols = this.state.current_symbols.slice();
    current_symbols[0]    = this.state.pool_symbols[this.state.block_info.position[newcount] - 1]
    current_symbols[1]    = this.state.pool_symbols[2-this.state.block_info.position[newcount]]


      // start new block or update reset feedbacks for next trial (without mutation)
      if (end_of_block){
        setTimeout(() => this.redirectToBlock()
                , 1000);        
      }
      else {
        setTimeout(() => this.setState({
          clickable  : true,
          feedback   : Array(2).fill(null),
          noFeedback : Array(2).fill('null'),
          symbolHighlight: Array(2).fill('null'),
          animation  : true,
          block_info : {...this.state.block_info, trial_numb:newcount},
          current_symbols : current_symbols,
          showFeedback: false         
        }), 1000);     
      }
    }
  
// second one about displaying the feedback and passing to the next trial once confidence rating is given 
  handleClick(i) {

    
    if (this.state.clickable) {

      const feedback        = this.state.feedback.slice();
      const noFeedback      = this.state.noFeedback.slice();
      const symbolHighlight = this.state.symbolHighlight.slice();
      
    // complete feedback 
    if (this.state.block_info.block_feedback==="2") {
        if (this.state.block_info.position[this.state.block_info.trial_numb] === "1") {
         // symbol 1 is on the left
          feedback[i]   = this.state.block_info.reward_1[this.state.block_info.trial_numb]*(i===0) + this.state.block_info.reward_2[this.state.block_info.trial_numb]*(i===1)
          feedback[1-i] = this.state.block_info.reward_2[this.state.block_info.trial_numb]*(i===0) + this.state.block_info.reward_1[this.state.block_info.trial_numb]*(i===1)
        }
        else {

          // symbol 1 is on the right 
          feedback[i]   = this.state.block_info.reward_1[this.state.block_info.trial_numb]*(i===1) + this.state.block_info.reward_2[this.state.block_info.trial_numb]*(i===0)
          feedback[1-i] = this.state.block_info.reward_2[this.state.block_info.trial_numb]*(i===1) + this.state.block_info.reward_1[this.state.block_info.trial_numb]*(i===0)
       
        }

        noFeedback[1 - i]    = ''
        noFeedback[i]        = ''
        symbolHighlight[i]   = ''
        symbolHighlight[1-i] = 'null'

      }
    else  // partial feedback 
      {
        if (this.state.block_info.position[this.state.block_info.trial_numb] === "1") {

          feedback[i]   = this.state.block_info.reward_1[this.state.block_info.trial_numb]*(i===0) + this.state.block_info.reward_2[this.state.block_info.trial_numb]*(i===1)
       
        }
        else {
          feedback[i]   = this.state.block_info.reward_1[this.state.block_info.trial_numb]*(i===1) + this.state.block_info.reward_2[this.state.block_info.trial_numb]*(i===0)
          
        }

      feedback[1 - i]      = null // unchosen option this will work for the partial feedback
      noFeedback[1 - i]    = 'null'
      noFeedback[i]        = ''
      symbolHighlight[i]   = ''
      symbolHighlight[1-i] = 'null'
    
    }
  
      this.setState({        
        feedback   : feedback,
        clickable  : false,
        // animation  : false,
        noFeedback : noFeedback,
        symbolHighlight: symbolHighlight, 
        showConf: true, 
      })

    
      // save information
      let position         = (i === 0) ? 'left' : 'right'; 
      let chosen_positions = this.state.chosen_positions;
      chosen_positions.push(position)

      // chosen_symbol :  
      let chosen_symbols = this.state.chosen_symbols;
      if (this.state.block_info.position[this.state.block_info.trial_numb] === "1" & (i === 0)) {
          var chosen_symbol = 1
        }
      else if (this.state.block_info.position[this.state.block_info.trial_numb] === "2" & (i === 1)) {
          var chosen_symbol = 1
        }
      else {
        var chosen_symbol = 2
      }

      chosen_symbols.push(chosen_symbol)  
      // console.log('Chosen_symbol',chosen_symbols)

      const chosen_r_th   = chosen_symbol===1 ? this.state.block_info.th_reward_1[this.state.block_info.trial_numb] : this.state.block_info.th_reward_2[this.state.block_info.trial_numb];
      const unchosen_r_th = chosen_symbol===1 ? this.state.block_info.th_reward_2[this.state.block_info.trial_numb] : this.state.block_info.th_reward_1[this.state.block_info.trial_numb];
      
      
      const chosen_r   = chosen_symbol===1 ? this.state.block_info.reward_1[this.state.block_info.trial_numb] : this.state.block_info.reward_2[this.state.block_info.trial_numb];
      const unchosen_r = chosen_symbol===1 ? this.state.block_info.reward_2[this.state.block_info.trial_numb] : this.state.block_info.reward_1[this.state.block_info.trial_numb];
      
      // console.log('Chosen reward theoretical',chosen_r_th)
      // console.log('Unchosen reward theoretical',unchosen_r_th)

      // console.log('Chosen reward',chosen_r)
      // console.log('Unchosen reward',unchosen_r)

      // console.log('Observed chosen feedback',feedback[i])
      // console.log('Observed unchosen feedback',feedback[1-i])
      
      // Alternatively we could just use the reward sequences stored in the block_info but this is a check if there any trial that has been repeated etc: 
      const rwd_1 = this.state.block_info.reward_1[this.state.block_info.trial_numb]
      const rwd_2 = this.state.block_info.reward_2[this.state.block_info.trial_numb]
      
      let block_perf = this.state.block_perf + ((chosen_r_th-unchosen_r_th)/this.state.block_info.position.length) 

      let reaction_times           = this.state.reaction_times;
      var date                     = new Date()
      let reaction_time            = date.getTime() - this.prev_reaction_time_date // choice reaction time 
      this.prev_reaction_time_date = date.getTime()
      reaction_times.push(reaction_time)

      let chosen_rewards   = this.state.chosen_rewards; 
      chosen_rewards.push(feedback[i])

      let unchosen_rewards = this.state.unchosen_rewards; 
      unchosen_rewards.push(feedback[1-i])

      let reward_1 = this.state.reward_1
      reward_1.push(rwd_1)

      let reward_2 = this.state.reward_2
      reward_2.push(rwd_2)
      
      this.setState({        
        chosen_positions : chosen_positions,
        chosen_symbols   : chosen_symbols,
        chosen_rewards   : chosen_rewards,
        unchosen_rewards : unchosen_rewards, 
        reaction_times   : reaction_times,
        block_perf       : block_perf, 

      }) 
   }
  
   if (this.state.displayConf===false) {

    // console.log('Confidence value is not provided') 
    
    let confidence      = this.state.confidence; 
    let rt_confidence   = this.state.reaction_times_conf;
    let confidence_init = this.state.confidence_init; 
    
    confidence.push(-1000) // for consistency in the DB  
    rt_confidence.push(-1000)
    confidence_init.push(-1000) 


      this.setState({        
        confidence : confidence, 
        reaction_times_conf : rt_confidence,
        confidence_init: confidence_init,
        showFeedback: true, 
        animation: false
      }) 

      // update symbol without Mutation
      const newcount     = this.state.block_info.trial_numb + 1
      const end_of_block = (newcount === this.state.block_info.TotalTrial ? true : false ) ? true : false 
    
      // new symbols
      const current_symbols = this.state.current_symbols.slice();
      current_symbols[0]    = this.state.pool_symbols[this.state.block_info.position[newcount] - 1]
      current_symbols[1]    = this.state.pool_symbols[2-this.state.block_info.position[newcount]]


      // start new block or update reset feedbacks for next trial (without mutation)
      if (end_of_block){
        setTimeout(() => this.redirectToBlock()
                , 1000);        
      }
      else {
        setTimeout(() => this.setState({
          clickable  : true,
          feedback   : Array(2).fill(null),
          noFeedback : Array(2).fill('null'),
          symbolHighlight: Array(2).fill('null'),
          // animation  : true,
          block_info : {...this.state.block_info, trial_numb:newcount},
          current_symbols : current_symbols,
          showFeedback: false         
        }), 1000);     
      }
  
   }
  }


  redirectToBlock ()

  // Compute the block relative performance: 


  {
    let block_id   = this.state.block_info.block_number

    let body     = {        'block_number'     : this.state.participant_info.block_number+1,
                            'block_learning'   : this.state.block_info.block_learning, 
                            'block_feedback'  : this.state.block_info.block_feedback, 
                            'chosen_positions' : this.state.chosen_positions,
                            'chosen_symbols'   : this.state.chosen_symbols,
                            'chosen_rewards'   : this.state.chosen_rewards,
                            'unchosen_rewards' : this.state.unchosen_rewards,
                            'reaction_times'   : this.state.reaction_times,
                            'block_perf'       : this.state.block_perf,
                            'completed'        :'yes',
                            'date_time'        : this.state.participant_info.date_time, 
                            'game_id'          : this.state.participant_info.game_id, 
                            'reward_1'         : this.state.reward_1, // this.state.block_info.reward_1, 
                            'reward_2'         : this.state.reward_2, // this.state.block_info.reward_2,
                          }  

    console.log('Board POST',body)
    fetch(`${API_URL}/participants_data_banditgame/create/` + this.state.participant_info.participant_id + `/` + block_id + `/` + this.state.participant_info.prolific_id, {
       method: 'POST',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(body)
     })

  
    // for each key in cashed object append the values
    var cashed_update = this.state.cashed
    // console.log('This state cash', this.state.cashed)
    if (Object.keys(cashed_update).length === 0 && cashed_update.constructor === Object || cashed_update === '' || cashed_update ===undefined) {
      // console.log('cash is empty: first session', this.state.cashed)
      
      const keys = ['block_number','chosen_positions','chosen_symbols','chosen_rewards', 
                    'unchosen_rewards',
                    'reaction_times',
                    'block_perf', 
                    'confidence',
                    'confidence_init',
                    'reaction_times_conf',
                    'reward_1',
                    'reward_2'] 
      
      for (const key of keys) {
        cashed_update[key] = [body[key]] // wrap into an array here 
      }

      // cashed_update = body
    }
    else {
    try {
      const keys = Object.keys(cashed_update)
      
      for (const key of keys) {
        
        let val  = cashed_update[key]
        let val2 = body[key]

        val.push(val2)
        cashed_update[key] = val
      }

    } catch (e) {
      // console.log('Failed to append')
      cashed_update = this.state.cashed
    }

    } 

    // Push new data to local storage 
    sessionStorage.setItem("cashed", JSON.stringify(cashed_update));

    this.props.history.push({
      pathname: `/Block`,
      state: {participant_info:this.state.participant_info, newblock_frame : false, startQuiz: true}
    })    
  }

  render() {

    return (
      <div>
        <div  className="allBricks">
        <span className='brick1'> {this.renderBrick(0)} </span>
        <span className='brick2'> {this.renderBrick(1)} </span>
        </div>
      
        <center>
        <div className='conf'> {this.renderConf()}</div>
        </center>
      
      </div>
          );
  }
}

export default withRouter(Board);






