import React from 'react';
import { API_URL } from '../../config';
import Quiz from '../Quiz/Quiz';
import Report from '../Report/Report';
import ReportNA from '../ReportNA/ReportNA';
import FreeReport from '../FreeReport/FreeReport';
import ButtonQuiz from '../ButtonQuiz/ButtonQuiz';
import CheckboxQuiz from '../CheckboxQuiz/CheckboxQuiz'; 


class QuizBlock extends React.Component {
  constructor(props) {
    super(props);

    // Get the right questions JSON part
    var quizQuestionsBlock = this.props.location.state.questions.filter(d => d.surveytag === this.props.location.state.block_info.surveytag);
    
    // console.log('Game_id QuizBlock',this.props.location.state.participant_info.game_id)

    var date_time_now = new Date().toLocaleString();
    
    
    // console.log('QuizBlock Props PINFO:',this.props.location.state.participant_info)
  
    this.state = {
      counter: 0,
      questionCount: 1, // count across all questions in the questionnaire 
      question: '',
      answerOptions: [],
      answer: '',
      qtype: '',      // the type of the question to be asked
      questionId: '', // Question id stored in the JS object, does not have to be consecuitive. 
      answersCount: {},
      result: '',
      constraint: [], 
      quizQuestionsBlock: quizQuestionsBlock,
      participant_info: this.props.location.state.participant_info,
      image: '',    // image question
      image_a: '', // image - answer if available
      date_time_start: date_time_now,
      // This is to be recorded and POSTED to the DB
      answered_questionsId      : [],
      answered_questionsContent : [],
      cashed           : {}, 
      TotalQuestion :  quizQuestionsBlock.length, 
      step: 1
    
    };

   this.handleAnswerSelected  = this.handleAnswerSelected.bind(this);
   this.redirectToSurvey      = this.redirectToSurvey.bind(this);
   this.hydrateStateWithLocalStorage = this.hydrateStateWithLocalStorage.bind(this) 

    
  }

  componentDidMount() {
    const firstQuestion = this.state.quizQuestionsBlock[0]
    const image_item    = (this.state.quizQuestionsBlock[0].image=== undefined) ? null : require('../../images/' + this.state.quizQuestionsBlock[0].image)
    const image_a       = (this.state.quizQuestionsBlock[0].image_a=== undefined) ? null : require('../../images/' + this.state.quizQuestionsBlock[0].image_a)
     
    var shuffledAnswerOptions = this.state.quizQuestionsBlock.map(question =>this.NoShuffleArray(question.answers)); 
    document.body.style.background= '#fff';
    this.setState({
      questionId:    firstQuestion.questionId,
      qtype:         firstQuestion.qtype,
      question:      firstQuestion.question,
      answerOptions: shuffledAnswerOptions[0],
      constraint:    firstQuestion.constraint,
      image:         image_item, 
      image_a:       image_a, 
      
    });

    this.hydrateStateWithLocalStorage();
    
  }


  hydrateStateWithLocalStorage() {

       // if the key exists in localStorage
       if (sessionStorage.hasOwnProperty('cashed')) {
         let cashed_ = sessionStorage.getItem('cashed');
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


  shuffleArray(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue      = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex]  = temporaryValue;
    }

    return array;
  }

NoShuffleArray(array) {
    var currentIndex = array.length;
    return array;
  }
  // onAnswerSelected points to this function in AnswerOption.js 
  handleAnswerSelected(answerContent,questionId,event) {
    
    this.setUserAnswer(event.currentTarget.value,answerContent,questionId); 

    // Recompute total number of questions here: 
    var TotalQuestion = this.state.TotalQuestion
    var step          = this.state.step 

    if (this.state.quizQuestionsBlock[this.state.counter].condition===true) {// Next question is defined based on the previous answer 

      if (event.currentTarget.value==='gad-4'){ // this is a Not at all answer in GAD
        step = 2
        TotalQuestion = TotalQuestion - 1
     }
     else {
      step = 1
     }
    }
    else if (this.state.quizQuestionsBlock[this.state.counter].condition===undefined){
      step = 1
    }

    this.setState({
      TotalQuestion: TotalQuestion, 
      step: step, 
    })
    

    if (this.state.questionCount < TotalQuestion) { // this.state.TotalQuestion   
      setTimeout(() => this.setNextQuestion(), 300);
    } else {
      setTimeout(() => this.redirectToSurvey(), 300); 
    }
  }

  setUserAnswer(answer,answerContent,questionId) {

    // This is to be recorded and POSTED to the DB
    let answered_questionsId = this.state.answered_questionsId;
      answered_questionsId.push(questionId)

    let answered_questionsContent = this.state.answered_questionsContent;
      answered_questionsContent.push(answerContent)

    this.setState((state, props) => ({
      answer: answer,
      answered_questionsId: answered_questionsId,
      answered_questionsContent: answered_questionsContent, 
    }));

  }

  setNextQuestion() {

    const counter       = this.state.counter + this.state.step;
    const questionCount = this.state.questionCount + 1;
    const nextQuestion  = this.state.quizQuestionsBlock[counter]
    const image_item    = (this.state.quizQuestionsBlock[counter].image=== undefined) ? null : require('../../images/' + this.state.quizQuestionsBlock[counter].image)
    const image_a       = (this.state.quizQuestionsBlock[counter].image_a=== undefined) ? null : require('../../images/' + this.state.quizQuestionsBlock[counter].image_a)
        

    this.setState({
      counter: counter,
      questionCount: questionCount,
      questionId: nextQuestion.questionId,
      question: nextQuestion.question,
      answerOptions: nextQuestion.answers,
      answer: '',
      qtype: nextQuestion.qtype,
      constraint: nextQuestion.constraint,
      image: image_item,
      image_a: image_a,
    });
  }

  redirectToSurvey ()

  {
    let block_id = this.state.participant_info.block_number_survey+1
    // console.log('Block_number QuizBlock:', this.state.participant_info.block_number)
    var date_time_now = new Date().toLocaleString();
    
    if (this.state.participant_info.block_number_survey < this.state.participant_info.TotalBlock) {
      var completed = 'no'}
    else if (this.state.participant_info.block_number_survey === this.state.participant_info.TotalBlock) {
      var completed = 'yes'
    }

    let body     = {        'participant_id'  : this.state.participant_info.participant_id, 
                            'prolific_id'     : this.state.participant_info.prolific_id,
                            'study_id'        : this.state.participant_info.study_id,
                            'block_number'    : this.state.participant_info.block_number_survey+1, 
                            'block_name'      : this.props.location.state.block_info.surveytag, 
                            'question_ids'    : this.state.answered_questionsId, 
                            'answers'         : this.state.answered_questionsContent,
                            'survey_completed': completed,
                            'date_time_survey_start'  : this.state.date_time_start,
                            'date_time_survey_end'    : date_time_now,
                            'date_time'       : this.props.location.state.participant_info.date_time, 
                            'date'            : this.props.location.state.participant_info.date,
                            'game_id'         : this.props.location.state.participant_info.game_id // need for indetification in case prolific id is undefined

                             
                          }

  // console.log(body)
  fetch(`${API_URL}/participants_question_data_followup/create/` + this.state.participant_info.participant_id + `/` + block_id + `/` + this.state.participant_info.prolific_id, {
       method: 'POST',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
       },    
       body: JSON.stringify(body)
     })

    // for each key in cashed object append the values
    var cashed_update = this.state.cashed
    if (Object.keys(cashed_update).length === 0 && cashed_update.constructor === Object || cashed_update === '' || cashed_update ===undefined) {
      
    const keys = ['block_number','block_name', 
                    'question_ids',
                    'answers',
                    'date_time_survey_start',
                    'date_time_survey_end']

      for (const key of keys) {
        cashed_update[key] = [body[key]] // wrap into an array here 
      }
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
    // console.log('Saving cash')
    sessionStorage.setItem("cashed", JSON.stringify(cashed_update));

  this.props.history.push({
      pathname: `/Survey`,
      state: {participant_info:this.state.participant_info,newblock_frame: false, finished: true}
    })
  }
  
  setResults(result) {
    if (result.length === 1) {
      this.setState({ result: result[0] });
    } else {
      this.setState({ result: 'Undetermined' });
    }
  }

  renderQuiz() {
    if (this.state.qtype === "quiz") 
    { 
      return (
        <Quiz
          answer          ={this.state.answer}  
          answerOptions   ={this.state.answerOptions} 
          questionId      ={this.state.questionId}
          questionCount   ={this.state.questionCount}
          question        ={this.state.question}
          questionTotal   ={this.state.TotalQuestion}
          onAnswerSelected={this.handleAnswerSelected}
          image           ={this.state.image}
          image_a         ={this.state.image_a}
          // Add line for the part of the study: NEW 
          survey_part     ={this.state.participant_info.block_number_survey+1}
          surveyTotal     ={this.state.participant_info.TotalBlock+1}
        />
      );
    } 

    else if (this.state.qtype === "report")

    {  
      return (
        <Report
          answer          ={this.state.answer}
          answerOptions   ={this.state.answerOptions}
          questionId      ={this.state.questionId}
          questionCount   ={this.state.questionCount}
          question        ={this.state.question}
          questionTotal   ={this.state.TotalQuestion}
          onAnswerSelected={this.handleAnswerSelected}
          constraint      ={this.state.constraint}
          survey_part     ={this.state.participant_info.block_number_survey+1}
          surveyTotal     ={this.state.participant_info.TotalBlock+1}
      
        />
      );
  }

  else if (this.state.qtype === "report-na") 
  {

    return (
        <ReportNA
          answer          ={this.state.answer}
          answerOptions   ={this.state.answerOptions}
          questionId      ={this.state.questionId}
          questionCount   ={this.state.questionCount}
          question        ={this.state.question}
          questionTotal   ={this.state.TotalQuestion}
          onAnswerSelected={this.handleAnswerSelected}
          constraint      ={this.state.constraint}
          survey_part     ={this.state.participant_info.block_number_survey+1}
          surveyTotal     ={this.state.participant_info.TotalBlock+1}
      
      />
    );
  }

  else if (this.state.qtype === "free-report") 
  {
    return (
        <FreeReport
          answer          ={this.state.answer}
          answerOptions   ={this.state.answerOptions}
          questionId      ={this.state.questionId}
          questionCount   ={this.state.questionCount}
          question        ={this.state.question}
          questionTotal   ={this.state.TotalQuestion}
          onAnswerSelected={this.handleAnswerSelected}
          constraint      ={this.state.constraint}
          survey_part     ={this.state.participant_info.block_number_survey+1}
          surveyTotal     ={this.state.participant_info.TotalBlock+1}
      
      />
    );
  }

  else if (this.state.qtype === "button") 
  {
    return (
        <ButtonQuiz 
          questionId      ={this.state.questionId}
          questionCount   ={this.state.questionCount}
          question        ={this.state.question}
          questionTotal   ={this.state.TotalQuestion}
          onAnswerSelected={this.handleAnswerSelected}
          survey_part     ={this.state.participant_info.block_number_survey+1}
          surveyTotal     ={this.state.participant_info.TotalBlock+1}
      
      />
    );
  }

    else if (this.state.qtype === "checkbox") 
  {
    return (
        <CheckboxQuiz 
          answer          ={this.state.answer}  
          answerOptions   ={this.state.answerOptions} 
          questionId      ={this.state.questionId}
          questionCount   ={this.state.questionCount}
          question        ={this.state.question}
          questionTotal   ={this.state.TotalQuestion}
          onAnswerSelected={this.handleAnswerSelected}
          survey_part     ={this.state.participant_info.block_number_survey+1}
          surveyTotal     ={this.state.participant_info.TotalBlock+1}
      
      />
    );
  }
}

  render() {
    return (
      <div className="QuizBlock">
        {this.state.result ? this.redirectToSurvey() : this.renderQuiz()} 
      </div>
    );
  }
}

export default QuizBlock;

/*
Section header 
<div className="QuizBlock-header">
          <h2>{this.state.quizQuestionsBlock[this.state.counter].title}</h2>
        </div>
*/ 
