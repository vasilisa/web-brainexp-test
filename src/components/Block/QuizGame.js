// Component to test users knowledge of the game after the training 
// Added on May 2020 

import React from 'react';
import Quiz from '../Quiz/Quiz'; // this is to render the quiz elements 
import {withRouter} from 'react-router-dom';
import { Button } from 'react-bootstrap';
import './QuizGame.css';


class QuizGame extends React.Component {

constructor(props) {
    super(props);

    var shuffledAnswerOptions = this.props.location.state.quizQuestions.map(question =>this.shuffleArray(question.answers)); 
    
    const firstQuestion = this.props.location.state.quizQuestions[0]
    const image_item    = (this.props.location.state.quizQuestions[0].image=== undefined) ? null : require('../../images/' + this.props.location.state.quizQuestions[0].image)
    const image_a       = (this.props.location.state.quizQuestions[0].image_a=== undefined) ? null : require('../../images/' + this.props.location.state.quizQuestions[0].image_a)
    

    this.state ={

      questionId:    firstQuestion.questionId,
      qtype:         firstQuestion.qtype,
      question:      firstQuestion.question,
      answerOptions: shuffledAnswerOptions[0],
      constraint:    firstQuestion.constraint,
      image:         image_item, 
      image_a:       image_a, 
      answerOptions: shuffledAnswerOptions[0], 
      answer: '',
      answers: [],  
      counter: 0, 
      passQuiz: false, 
      quizQuestions: this.props.location.state.quizQuestions,
      answered_questionsId      : [],
      check: '',
      participant_info: this.props.location.state.participant_info,
      
     
    }

  this.handleAnswerSelected  = this.handleAnswerSelected.bind(this);
  this.redirectToBlock       = this.redirectToBlock.bind(this)
  }


  componentDidMount() {
    // console.log('Mounted!')

    const firstQuestion = this.state.quizQuestions[0]
    const image_item    = (this.state.quizQuestions[0].image=== undefined) ? null : require('../../images/' + this.state.quizQuestions[0].image)
    const image_a       = (this.state.quizQuestions[0].image_a=== undefined) ? null : require('../../images/' + this.state.quizQuestions[0].image_a)
     
    var shuffledAnswerOptions = this.state.quizQuestions.map(question =>this.shuffleArray(question.answers)); 
    
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
  }

  

// Shuffle the order of question answers 
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

  // onAnswerSelected points to this function in AnswerOption.js 
  handleAnswerSelected(answerContent,questionId,event) {
    
    this.setUserAnswer(event.currentTarget.value,answerContent,questionId); 
   if (this.state.counter < this.state.quizQuestions.length-1) {    
      setTimeout(() => this.setNextQuestion(), 300);
    } else {
      setTimeout(() => this.quizCheck(), 300);  // call the checking of correct answers 
    }
  }

setUserAnswer(answer,answerContent,questionId) {

    let answered_questionsId = this.state.answered_questionsId;
      answered_questionsId.push(questionId)

    let answers = this.state.answers;
      answers.push(answer)

    this.setState((state, props) => ({
      answer: answer, 
      answers: answers,
      answered_questionsId: answered_questionsId,
    }));


  }

  setNextQuestion() {
    const counter       = this.state.counter + 1;
    const questionCount = this.state.questionCount + 1;
    const nextQuestion  = this.state.quizQuestions[counter]
    const image_item    = (this.state.quizQuestions[counter].image=== undefined) ? null : require('../../images/' + this.state.quizQuestions[counter].image)
    const image_a       = (this.state.quizQuestions[counter].image_a=== undefined) ? null : require('../../images/' + this.state.quizQuestions[counter].image_a)
        

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

  quizCheck(){
    let check = 0
    
    const correct_seq = [1,3,2]
    const keys = Object.keys(this.state.answers)
    
    for (const key of keys) {
      (parseInt(this.state.answers[key])===correct_seq[key]) ? check = check + 1 : check = check
    }

    // check === 4 ? console.log('Hurrray') : console.log('Neeeeeej')

    this.setState({
      check: check, 
      passQuiz: true
    })
  }

    quizFeedback() {

    let text
  
    
    if (this.state.check===3) {

        text = <div className='QuizText'>
                <p><span className = "bold">Bravo!</span> You passed the quiz!</p>
                <br></br>
                </div>

      return (
        <div>
        <center> 
        <div className="quizButtonContainer">
          <div>
            {text}           
          </div> 
            <center>
            <Button className="buttonQuiz" onClick={()=>this.redirectToBlock()}>
            CONTINUE
            </Button>
            </center>
          </div>
          </center>
          </div>);
    }

    else {

      text = <div className='QuizText'>
        <p><span className = "bold">Oops!</span> One or more answers were incorrect!</p>
        </div>

        return (
        <div>
        <center> 
        <div className="quizButtonContainer">
          <div>
            {text}           
          </div> 
            <center>
            <Button className="buttonQuiz" onClick={()=>this.restartQuiz()}>
            RESTART QUIZ
            </Button>
            </center>
          </div>
          </center>
          </div>);
      }
   
  }
	
  // Function to be called : check whether all answers are correct and if so - redirect to parent Block component 
  redirectToBlock() {
    this.props.history.push({
      pathname: `/Block`,
      state: {participant_info:this.state.participant_info,newblock_frame: false, startQuiz:false}
    })
  
  }

  restartQuiz() {

    var shuffledAnswerOptions = this.state.quizQuestions.map(question =>this.shuffleArray(question.answers)); 
    
    const firstQuestion = this.props.location.state.quizQuestions[0]
    const image_item    = (this.props.location.state.quizQuestions[0].image=== undefined) ? null : require('../../images/' + this.props.location.state.quizQuestions[0].image)
    const image_a       = (this.props.location.state.quizQuestions[0].image_a=== undefined) ? null : require('../../images/' + this.props.location.state.quizQuestions[0].image_a)
    


    this.setState({
      questionId:    firstQuestion.questionId,
      qtype:         firstQuestion.qtype,
      question:      firstQuestion.question,
      answerOptions: shuffledAnswerOptions[0],
      constraint:    firstQuestion.constraint,
      image:         image_item, 
      image_a:       image_a, 
      answerOptions: shuffledAnswerOptions[0], 
      answer: '',
      answers: [],  
      counter: 0, 
      passQuiz: false, 
      answered_questionsId: [],
      check: '' 

    }) 

  }


  renderQuiz() {
    // console.log('answer options', this.state.answerOptions)
      return (
        <Quiz
          answer          ={this.state.answer}  
          answerOptions   ={this.state.answerOptions} 
          questionId      ={this.state.questionId}
          questionCount   ={this.state.counter}
          question        ={this.state.question}
          questionTotal   ={this.state.quizQuestions.length}
          onAnswerSelected={this.handleAnswerSelected}
          image           ={this.state.image}
          image_a         ={this.state.image_a}
          survey_part     ={1}
          surveyTotal     ={1}
        />
      );
    } 

render() {
  return (
      <div className="QuizGame">
        {this.state.passQuiz ? this.quizFeedback() : this.renderQuiz()}
      </div>
);
}
}

export default withRouter(QuizGame);

/* {passQuiz ? redirectToBlock() : renderQuiz()} */ 









