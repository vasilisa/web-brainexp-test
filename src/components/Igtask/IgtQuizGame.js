// Component to test users knowledge of the game after the training 
// Added on May 2020 

import React from 'react';
import Quiz from '../Quiz/Quiz'; // this is to render the quiz elements 
import {withRouter} from 'react-router-dom';
import { Button } from 'react-bootstrap';
import './IgtQuizGame.css';


class IgtQuizGame extends React.Component {

constructor(props) {
    super(props);

const shuffle = true 

// Select the questions that are taken into the quiz 

    var shuffledAnswerOptions = this.props.location.state.quizQuestions.map(question =>this.shuffleArray(question.answers,shuffle)); 
    
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
      quizrun: this.props.location.state.quizrun,
      correct_seq: [],
      totalscore: this.props.location.state.participant_info.totalscore  
    }

  this.handleAnswerSelected  = this.handleAnswerSelected.bind(this);
  this.redirectToBlock       = this.redirectToBlock.bind(this)
  }


  componentDidMount() {
  
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
shuffleArray(array,shuffle) {


  if (shuffle==true) {

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

  else
  {
    return array;
  }
  
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
    let check       = 0
    let correct_seq = []
    if (this.state.quizrun === 1) {
     
      correct_seq = [1,2,1,1,2]
     
    }
    else {
     
      correct_seq = [1,1]
    }

    const keys = Object.keys(this.state.answers)
  
    for (const key of keys) {
      (parseInt(this.state.answers[key])===correct_seq[key]) ? check = check + 1 : check = check
    }

    
    this.setState({
      check: check, 
      passQuiz: true,
      correct_seq: correct_seq
    })
  }

    quizFeedback() {

    let text
    
    if (this.state.check===this.state.correct_seq.length) {

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

      text = <div className='textbox'>
        <p><span className = "bold">Oops!</span> One or more answers were incorrect!</p>
        </div>
        let instimage
        let mytext
        if (this.state.quizrun===1) {
          instimage =  <img className="quizgameimg" src={require('../../images/IGT_inst1.png')} alt='quizgameimg'/>
          mytext = <div className='textbox'><p><span className='bold'>Your goal is to choose the colour that you think is more plentiful</span>.</p>
            <p>If you choose a correct colour you will earn <span className="bold">100 points</span>, otherwise you will lose <span className="bold">-100 points</span>.</p>
            <p>Before you make your choice, you can <span className="bold"> open as many boxes as you want until you feel certain enough</span>.</p>
            <p>Once you feel certain enough, you can decide for the colour by clicking on the coloured boxes below.</p>
            </div>
        }
        else {
          instimage =  <img className="quizgameimg" src={require('../../images/IGT_inst2.png')} alt='quizgameimg'/> 
          mytext = <div className='textbox'><p><span className='bold'>Your goal is still to choose the colour that you think is more plentiful</span>.</p>
          <p>But with every box you open, you will win 10 points less.</p>
          <p>If you open, let's say 3 cards and you choose the correct colour, then you would win 220 points.</p>
          <p>However if you are wrong, you will <span className="bold">always lose 100 points</span>.</p>
          <p>You can see how much you can win on the score board on the top.</p>
          </div>
        }

        return (
        <div>
        <center> 
        <div className="quizButtonContainer">
          <div>
            {text}           
          </div>
          <br></br>
          <div>
            {mytext}
          </div>
            <div>    
              {instimage}
            </div>
            <p></p>    
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
    const newblocknumber = this.state.participant_info.run+1
    this.props.history.push({
      pathname: `/IgtBlock`,
      state: {participant_info: { ... this.state.participant_info, run:newblocknumber},newblock_frame: true, startQuiz:false} // false
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

export default withRouter(IgtQuizGame);

/* {passQuiz ? redirectToBlock() : renderQuiz()} */ 









