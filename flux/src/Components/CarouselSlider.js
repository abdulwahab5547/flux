import React, { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import CarouselOne from '../assets/carousel-one.jpg';
import CarouselTwo from '../assets/carousel-two.jpg';
import CarouselThree from '../assets/carousel-three.jpg';
import './CarouselSlider.css';
import Overlay from './Overlay';

function CarouselSlider({ colors }) {
  // Overlay state and functions
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [overlayContent, setOverlayContent] = useState(null);

  const toggleOverlay = (content) => {
    setOverlayContent(content);
    setIsOverlayVisible(true);
  };

  return (
    <div className='carousel-container pt-1'>
      <Carousel>
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-img"
            src={CarouselOne}
            alt="First slide"
            onClick={() => toggleOverlay(<img src={CarouselOne} className="overlay-car-img" alt="First slide" />)}
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-img"
            src={CarouselTwo}
            alt="Second slide"
            onClick={() => toggleOverlay(<img src={CarouselTwo} className="overlay-car-img" alt="Second slide" />)}
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-img"
            src={CarouselThree}
            alt="Third slide"
            onClick={() => toggleOverlay(<img src={CarouselThree} className="overlay-car-img" alt="Third slide" />)}
          />
        </Carousel.Item>
      </Carousel>

      <Overlay isVisible={isOverlayVisible} colors={colors} onClose={() => setIsOverlayVisible(false)}>
        {overlayContent}
      </Overlay>
    </div>
  );
}

export default CarouselSlider;