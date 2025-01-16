import React from 'react';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';

const ButtonContainer = styled.div`
  position: fixed;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
`;

const ScrollBox = styled.div`
  width: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  overflow: hidden;
`;

const ScrollButton = styled.button`
  width: 100%;
  height: 20px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 16px;
  padding: 0;

  &:first-of-type {
    border-bottom: 1px solid #ddd;
  }

  &:hover {
    background-color: #f0f0f0;
  }

  .anticon {
    color: #666;
  }
`;

const ScrollButtons = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  return (
    <ButtonContainer>
      <ScrollBox>
        <ScrollButton onClick={scrollToTop} title="Scroll to top">
          <UpOutlined />
        </ScrollButton>
        <ScrollButton onClick={scrollToBottom} title="Scroll to bottom">
          <DownOutlined />
        </ScrollButton>
      </ScrollBox>
    </ButtonContainer>
  );
};

export default ScrollButtons;
