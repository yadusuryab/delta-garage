'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import Slide1 from '@/public/slide1.jpg';
import Slide2 from '@/public/slide2.jpg';
import Slide3 from '@/public/slide3.jpg';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

function Hero() {
  return (
    <div className="w-full h-[400px] md:h-[600px] relative">
      <Swiper
        modules={[Pagination, Navigation]}
        pagination={{ clickable: false }}
        
        loop
        autoplay
        className="w-full h-full"
      >
        <SwiperSlide>
          <img
            src={Slide2.src || ''}
            alt="Slide 1"
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src={Slide1.src || ''}
            alt="Slide 2"
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
           src={Slide3.src || ''}
            alt="Slide 3"
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}

export default Hero;
