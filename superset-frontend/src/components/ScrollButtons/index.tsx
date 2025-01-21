/* eslint-disable */
// @ts-nocheck
import React from 'react';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';

const ButtonContainer = styled.div`
  position: fixed;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
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
  font-size: 10px;
  padding: 0;
  outline: none;

  &:first-of-type {
    border-bottom: 1px solid #ddd;
  }

  &:hover {
    background-color: #f0f0f0;
  }

  &:active {
    background-color: #e8e8e8;
  }

  .anticon {
    color: #666;
    font-size: 10px;
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
