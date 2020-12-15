import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransitionGroup } from 'react-transition-group';

import Question from '../QuizQuestion/Question';
import QuestionCount from '../QuizQuestion/QuestionCount';


// import './DateReport.css'; // style later 

class DateReport extends React.Component {

  constructor(props){
    super(props);

  this.state = {
    DOB: '',
    day: '',
    month: '',
    year: '',
    answer: '',
    answercheck: ''  

  }
  console.log(this.state) // initial states 

  this.handleSubmit       = this.handleSubmit.bind(this);  // the function from the parent that is called send data as props to the parent component   
  this.handleChangeDOB    = this.handleChangeDOB.bind(this);
}

  handleChangeDOB(event) {
  // console.log(event.target.value)
  
  this.setState({
    DOB: event.target.value,
    answercheck: false}
    );
  
  console.log(this.state)

  var test = event.target.value.split("-")
  var year = parseInt(test[0])
  

  if ((test.length ===3) & (year <= this.props.constraint[1].max) & (year > this.props.constraint[0].min)) { // prevent from entering the year for less than 18 years old 
    this.setState({
    answercheck: true }
    );

    console.log(this.state.answer) 
      
  }

}

  handleSubmit(event) {
        event.preventDefault();
        this.props.onAnswerSelected(this.state.DOB,this.props.questionId,event)
        
  }

render() {
  console.log(this.state.answer)
  return (
    <CSSTransitionGroup
      className="container"
      component="div"
      transitionName="fade"
      transitionEnterTimeout={800}
      transitionLeaveTimeout={500}
      transitionAppear
      transitionAppearTimeout={500}
    >
      <div key={this.props.questionId}>
        <QuestionCount counter={this.props.questionId} total={this.props.questionTotal} />
        <Question content={this.props.question} />

        <div className="col-md-6 no-padding">
        <input value={this.state.DOB} onChange={this.handleChangeDOB} name="dob" id="dob" className="form-control" placeholder="" type="date" required />
        </div>
      </div>
      <p></p>
      <div className="col-md-12 pad-20">
        <div>
          <button type="submit" className="btn btn-save btn-primary pad-20" disabled={!this.state.answercheck} onClick={this.handleSubmit}>Submit
            </button>
          </div>
      </div>
    </CSSTransitionGroup>
  );
}
}

DateReport.propTypes = {
  answer: PropTypes.string.isRequired,
  question: PropTypes.string.isRequired,
  questionId: PropTypes.number.isRequired,
  questionTotal: PropTypes.number.isRequired,
  onAnswerSelected: PropTypes.func.isRequired,
  constraint: PropTypes.array.isRequired
};

export default DateReport;