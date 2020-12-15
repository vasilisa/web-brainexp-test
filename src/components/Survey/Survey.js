import React from 'react';
import { Button } from 'react-bootstrap';
import {withRouter} from 'react-router-dom';
import { API_URL } from '../../config';
import { handleResponse } from '../helpers';

import './Survey.css';


// import other questionnaires the same way
import * as ocir from '../../questionnaires/OCIR';
import * as iq from '../../questionnaires/IQ';

// this is put here for debug purpose only - to redirect directly to Survey 
const survey_names = [
'ocir', // OCD
'iq',   // IQ, 
]


var quizData = {
  ocir: ocir, 
  iq: iq
  
}


class Survey extends React.Component {
  constructor(props){
    super(props);
    

    // Information about a specific block of the Survey: 
    const block_info = {
      surveytag    : this.props.location.state.participant_info.survey_list[0], // First questionnaire in the list 
      surveyname   : survey_names[0], // this.props.location.state.participant_info.survey_names[0],
      survey_names : survey_names, // this.props.location.state.participant_info.survey_names,
     }
    
    const n =  this.props.location.state.participant_info.survey_list.length-1;   

    const participant_info = {

      prolific_id           : this.props.location.state.participant_info.prolific_id, 
      participant_id        : this.props.location.state.participant_info.participant_id, 
      survey_list           : this.props.location.state.participant_info.survey_list, 
      TotalBlock            : n, 
      block_number_survey   : this.props.location.state.participant_info.block_number_survey, 
      date_time             : this.props.location.state.participant_info.date_time, 
      survey_names          : survey_names, // this.props.location.state.participant_info.survey_names,
  
    }

    console.log(block_info)
    console.log(participant_info)


    this.state = {
      participant_info : participant_info,
      block_info       : block_info,
      newblock_frame   : this.props.location.state.newblock_frame,  
      questions        : quizData[participant_info.survey_list[0]].default, // quizData[this.props.location.state.participant_info.survey_list[0]].default,
      finished         : false,
    }

    
    this.getSurveyBlock.bind(this);
    this.redirectToQuiz.bind(this); 
    this.redirectToEnd.bind(this); 
    this._isMounted = false;
    this._handleGoBack.bind(this); 
    this._handleTimeOut.bind(this);  
 
  }

  redirectToQuiz () {

    if((this.props.location.state.participant_info.block_number_survey <= (this.state.participant_info.TotalBlock)))
      
          {           
          if (this.state.newblock_frame){ // TRUE
          this.setState({newblock_frame : false})

          this.props.history.push({
           pathname: `/QuizBlock`,
           state: {participant_info: this.state.participant_info,
                   block_info      : this.state.block_info,
                   questions       : this.state.questions,
                 }
          })}
          else // FALSE 
          {
            if (this._isMounted)
            {
              if (this.props.location.state.participant_info.block_number_survey===this.state.participant_info.TotalBlock){ // just finished the LAST BLOCK 
              
                // redirect to the final 
                this.setState({finished: true})

              } 
              else if (this.props.location.state.participant_info.block_number_survey<this.state.participant_info.TotalBlock){ // just finished the LAST BLOCK 
              
              const newblocknumber = this.props.location.state.participant_info.block_number_survey + 1
              // console.log(newblocknumber)
              this.getSurveyBlock(newblocknumber,this.state.participant_info.survey_list,this.state.participant_info.survey_names)
              this.setState({newblock_frame: true, participant_info : {...this.state.participant_info, block_number_survey:newblocknumber},})

              }

            }
          }
        }
      }
    
  componentDidMount() { 
  this._isMounted = true;
  document.body.style.background= '#fff'; 
  // this._isMounted && this.getSurveyBlock(this.props.location.state.participant_info.block_number,this.props.location.state.participant_info.survey_list);
    window.history.pushState(window.state, null, window.location.href);
    window.addEventListener('popstate', e => this._handleGoBack(e));
    window.onbeforeunload = this._handleRefresh

  }

  componentWillUnmount() {
    clearTimeout(this._handleTimeOut);
    this._isMounted = false;
  }


  _handleRefresh(evt){
    return false // error message when refresh occurs
  }

  _handleGoBack(event){
    window.history.go(1);
  }

  _handleTimeOut() {
    console.log('Timeout:', this.state)
    setTimeout(() => {
     this.redirectToQuiz()
    }, 1000);
} 

 // Get info about the specific Survey Block: 
 getSurveyBlock(block_number_,survey_list_,survey_name_) {

    // console.log('Block Number Get Survey Block:',block_number_+1)

    const surveytag_block  = survey_list_[block_number_]
    const surveyname_block = survey_name_[block_number_]
     
    this.setState({ loading: true , questions: quizData[survey_list_[block_number_]].default, block_info : {...this.state.block_info, surveytag:surveytag_block, surveyname: surveyname_block}});

}

 redirectToEnd(){

    // Store the cashed data 

    let cashed_ = {}
    if (sessionStorage.hasOwnProperty('cashed')) {
        cashed_ = sessionStorage.getItem('cashed');

        try {
          cashed_ = JSON.parse(cashed_);
          // console.log('parsed cash',cashed_)
        } catch (e) {
          console.log('Cannot parse cashed')
        }
    }

    // Push cashed data to the DB
    var date_time_end = new Date().toLocaleString();

    let body_cashed = {
      'log'          : cashed_,  // this.state.cashed, 
      'date_time'    : this.state.participant_info.date_time, 
      'date_time_end': date_time_end, 
      'log_type'     : 'survey' 
    }

    fetch(`${API_URL}/attempts_followup/save_followup/`+ this.state.participant_info.participant_id + `/` + this.state.participant_info.prolific_id, {
       method: 'POST',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(body_cashed)
    })

      alert("You will now be redirected to the validation page. Please, confirm leaving the page. Thank you!")
      window.location = 'https://app.prolific.co/submissions/complete?cc=3769BDAB' // + this.props.location.state.participant_info.study_id // CHECK if validation code == stidu id
  }
  
  
render()
  { 
    let text
    if ((this.state.block_info.surveytag === this.props.location.state.participant_info.survey_list[0]) && (this.state.newblock_frame))
    { 
      text = <div className='SurveyIntroText'> <p>Dear Participant,</p>
      <p>Thank you for completing both games!</p>
      <p>We will now ask you to complete 2 questionnaires.</p>
      </div>

    return (
      <div>
      <center> 
      <div className="SurveyButtonContainer">
        <div>
          {text}
        </div> 
        <center>
          <Button className="btn btn-save btn-primary pad-20 width=20vh height-8vh" onClick={()=>this.redirectToQuiz()}>
            <span className="bold">CONTINUE</span>
          </Button>
        </center>
      </div>
      </center> 
      </div>);
    } 

     else if ((this.state.block_info.surveytag !== this.props.location.state.participant_info.survey_list[0]) && (this.state.newblock_frame)) 
    { 
        return(<div>{this._handleTimeOut()}</div>);
      }

    else if (this.state.participant_info.block_number_survey === this.state.participant_info.TotalBlock && this.state.finished===true) 
    {
        text = <div className='SurveyIntroText'> <p><span className="bold">You completed all games and surveys!</span></p>
            <br></br>
            <p> Thank you for your help in developing !</p>
            <br></br>
            
            <p>To find more about the Brain Explorer project please click <a href="https://BrainExplorer.net" target="_blank" rel="noopener noreferrer">here</a></p>
            <br></br>
            <p>To get information regarding how to access mental health services please click <a href="https://www.nhs.uk/using-the-nhs/nhs-services/mental-health-services/how-to-access-mental-health-services" target="_blank" rel="noopener noreferrer">here</a></p> 
            <br></br>
            <p>You will now be redirected to the validation page.</p>
            <p>Please, confirm leaving the page if prompted by the browser. Thank you!</p></div>
      
      return (
          <div>
            <center> 
            <div className='SurveyIntroText'>
                {text}  
            </div>
            <div>
              <Button variant="secondary" color="danger" size="lg" className="buttonInstructionFinal" type="submit" id="validate" onClick={() => this.redirectToEnd()}>Validate</Button>
            </div>
            </center>
            </div>
          );        
    }
          
    else if (this.state.block_info.survey_names[this.props.location.state.participant_info.block_number_survey].localeCompare('iq'))
    {

          // console.log(this.props.location.state.participant_info.block_number_survey)

          text  = 'Thank you! Please, complete the final reasoning survey now.'
        return (
          <div>
            <center> 
            <div className="SurveyButtonContainer">
            <div className='SurveyIntroText'>
              {text}
            </div> 
            <center>
            <Button className="btn btn-save btn-primary pad-20 width=20vh height-8vh" onClick={()=>this.redirectToQuiz()}>
              <span className="bold">CONTINUE</span>
            </Button>
            </center>
          </div>
        </center> 
        </div>);
    }

    else 
    {
      text = 'Thank you! Please, continue.'
        return (
      <div>
      <center>
      <div className="SurveyIntroText">
        {text}
      </div>
      <br></br>
      <center>
            <Button className="btn btn-save btn-primary pad-20 width=20vh height-8vh" onClick={()=> this.state.finished ? this.redirectToEnd() : this.redirectToQuiz()}>
              <span className="bold">CONTINUE</span>
            </Button>
            </center>
    </center>
    </div>);
    }        
  }

}

export default withRouter(Survey);