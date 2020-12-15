var quizQuestions = [

/*
  Questions for the LEARNOISE game quiz'
  by VS May 2020
*/

{
      question: "The goal of the game is",
      answers: [
          {
              type: "1",
              content: "To earn as many points as possible"
          },
          {
						type: "2",
						content: "To avoid getting as many points as possible"
          },
          {
						type: "3",
						content: "To equally chose each of the two slot machines"
          },
          {
              type: "4",
              content: "To click on the slot machines as fast as possible"
          }
      ],
      questionId: 1,
      surveytag: 'gquiz',
      title: '',
      qtype:"quiz",
      constraint: [
        {min: ""},
        {max: ""}
      ]
  },

  
   {
      question: "There is always one slot machine that",
      answers: [
          {
              type: "1",
              content: "Gives more or looses less points than the other one and it is alwyas the same slot machine"
          },
          {
            type: "2",
            content: "Always gives less than 50 points" 
          },
          {
            type: "3",
            content: "Gives more or looses less points than the other one and it changes over time" 
          },
          {
              type: "4",
              content: "Appears on the right" 
          }
      ],
      questionId: 2,
      surveytag: 'gquiz',
      title: '',
      qtype:"quiz",
      constraint: [
        {min: ""},
        {max: ""}
      ]
  },

   {
      question: "When slot machines show negative points, what does it mean?",
      answers: [
          {
              type: "1",
              content: "The sign doesn't matter: I should choose the machine which currently gives the biggest number"
          },
          {
            type: "2",
            content: "The sign does matter:I should choose the machine which currently gives the smallest number"
          },
          {
            type: "3",
            content: "Both slot machines make you win points"
          },
          {
              type: "4",
              content: "Points can't be negative."
          }
      ],
      questionId: 3,
      surveytag: 'gquiz',
      title: '',
      qtype:"quiz",
      constraint: [
        {min: ""},
        {max: ""}
      ]
  },

]

export default quizQuestions; 
