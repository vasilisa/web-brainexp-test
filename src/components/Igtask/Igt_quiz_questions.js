var quizQuestions = [

/*
  Questions for the IST game quiz'
  by VS July 2020
*/

{
      question: "How can I get the most points?",
      answers: [
          {
            type: "1",
            content: "By choosing the colour that is most likely to be the most plentiful across all available boxes"
          },
          {
						type: "2",
						content: "By choosing the colour that I like the most"
          },
          {
						type: "3",
						content: "By choosing the colour that I opened last"
          },
      ],
      questionId: 1,
      surveytag: 'quiz',
      title: '',
      qtype:"quiz",
      constraint: [
        {min: ""},
        {max: ""}
      ]
  },

  
   {
      question: "If after 13 trials I have opened 8 blue and 5 red boxes which colour is more likely to be most plentiful across all boxes?",
      answers: [
          {
            type: "1",
            content: "Red"
          },
          {
            type: "2",
            content: "Blue" 
          }
      ],
      questionId: 2,
      surveytag: 'quiz',
      title: '',
      qtype:"quiz",
      constraint: [
        {min: ""},
        {max: ""}
      ]
  },

   {
      question: "What am I rating my confidence on ?",
      answers: [
          {
              type: "1",
              content: "How confident I am that I chose the colour that is most plentiful across all boxes"
          },
          {
            type: "2",
            content: "How confident I am that I chose the colour that I like the most"
          },
      ],
      questionId: 3,
      surveytag: 'quiz',
      title: '',
      qtype:"quiz",
      constraint: [
        {min: ""},
        {max: ""}
      ]
  },

  {
      question: "If I choose my confidence level like this",
      answers: [
          {
              type: "1",
              content: "I'm quite CERTAIN that I chose the dominant colour across all boxes"
          },
          {
            type: "2",
            content: "I'm quite UNCERTAIN that I chose the dominant colour across all boxes"
          },
      ],
      questionId: 4,
      surveytag: 'quiz',
      title: '',
      qtype:"quiz",
      constraint: [
        {min: ""},
        {max: ""},
      ],
      image:'conf_quiz.png'
  },

    {
      question: "What is the advantage of performing well in this game?",
      answers: [
          {
              type: "1",
              content: "I will be done quickly "
          },
          {
            type: "2",
            content: "I will increase my bonus payment and earn more money at the end"
          },
      ],
      questionId: 5,
      surveytag: 'quiz',
      title: '',
      qtype:"quiz",
      constraint: [
        {min: ""},
        {max: ""},
      ],
  },
// These two last questions are for the second quiz after game round 1 
    {
      question: "How can I get the most points in this game round?",
      answers: [
          {
              type: "1",
              content: "By choosing the colour that is most plentiful across all available boxes while opening the fewest boxes"
          },
          {
            type: "2",
            content: "By choosing the colour that is most plentiful across all available boxes irrespective of the number of boxes I open"
          },
      ],
      questionId: 6,
      surveytag: 'quiz',
      title: '',
      qtype:"quiz",
      constraint: [
        {min: ""},
        {max: ""},
      ],
  },

  {
      question: "How many points can you possibly win after opening 5 cards ?",
      answers: [
          {
            type: "1",
            content: "200"
          },
          {
            type: "2",
            content: "250"
          },
      ],
      questionId: 7,
      surveytag: 'quiz',
      title: '',
      qtype:"quiz",
      constraint: [
        {min: ""},
        {max: ""},
      ],
  },

]

export default quizQuestions; 
