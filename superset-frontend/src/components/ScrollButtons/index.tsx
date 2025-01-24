/* eslint-disable */
// @ts-nocheck
import React from 'react';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';

const ButtonContainer = styled.div`
  position: fixed;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  pointer-events: none;
`;

const ScrollBox = styled.div`
  width: 35px;
  height: 35px;
  background-color: #18279A;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  overflow: hidden;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
`;

const ScrollButton = styled.button`
  width: 100%;
  height: 50%;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 0;
  outline: none;
  position: relative;

  &:first-of-type::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 25%;
    width: 50%;
    height: 1px;
    background-color: rgba(255, 255, 255, 0.3);
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .anticon {
    color: #ffffff;
    font-size: 12px;
  }
`;

const ScrollButtons = () => {
  const scrollAmount = 800; // Adjust this value to control scroll distance

  const scrollToDirection = (direction: 'up' | 'down') => {
    const scrollableElement = document.querySelector('.site-content');
    if (scrollableElement) {
      const currentScroll = scrollableElement.scrollTop;
      const newPosition = direction === 'up' 
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount;
      
      scrollableElement.scrollTo({
        top: newPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <ButtonContainer>
      <ScrollBox>
        <ScrollButton onClick={() => scrollToDirection('up')} title="Scroll up">
          <UpOutlined />
        </ScrollButton>
        <ScrollButton onClick={() => scrollToDirection('down')} title="Scroll down">
          <DownOutlined />
        </ScrollButton>
      </ScrollBox>
    </ButtonContainer>
  );
};

export default ScrollButtons;
