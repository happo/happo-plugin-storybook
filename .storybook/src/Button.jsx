import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  font-size: 1.5em;
  text-align: center;
  color: palevioletred;
`;

export default ({ children }) => <StyledButton>hello {children}</StyledButton>;
