import React from 'react'

import PropTypes from 'prop-types'

import './question1.css'

const Question1 = (props) => {
  return (
    <div className="question1-container">
      <span className="question1-text heading3">{props.question}</span>
      <span className="bodySmall">{props.answer}</span>
    </div>
  )
}

Question1.defaultProps = {
  answer:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non volutpat turpis. Mauris luctus rutrum mi ut rhoncus.',
  question: 'What types of cars do you sell?',
}

Question1.propTypes = {
  answer: PropTypes.string,
  question: PropTypes.string,
}

export default Question1
