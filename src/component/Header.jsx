import React from 'react';
import {
  Col, Row
} from 'react-bootstrap';

export default () => (
  <>
		<Row key="header">
			<Col className="game-name">
				<h1>Uncovered!</h1>
			</Col>
		</Row>
		<Row key="help">
			<Col className="instructions">
        <a href="https://github.com/shaoster/uncovered" target="_blank" rel="noopener noreferrer">
          How do I play?
        </a>
      </Col>
		</Row>
  </>
);
