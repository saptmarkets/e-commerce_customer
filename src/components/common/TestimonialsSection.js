import React, { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Image from 'next/image';
import useUtilsFunction from '@hooks/useUtilsFunction';

const TestimonialsSection = ({ title, description, testimonials: propTestimonials }) => {
  const { showingTranslateValue } = useUtilsFunction();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [fadeDirection, setFadeDirection] = useState('in');
  
  const defaultTestimonials = [
    {
      id: 1,
      name: { en: "Sarah Al-Mahmoud", ar: "سارة المحمود" },
      rating: 5,
      message: {
        en: "Outstanding quality and lightning-fast delivery! SAPT Markets has completely changed how I shop for groceries. The produce is always fresh, and the convenience is unmatched.",
        ar: "جودة رائعة وتوصيل سريع جدًا! أسواق سبت غيرت تمامًا طريقة تسوقي للبقالة. المنتجات دائمًا طازجة والراحة لا مثيل لها."
      },
      image: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
      id: 2,
      name: { en: "Ahmed Al-Rashid", ar: "أحمد الراشد" },
      rating: 5,
      message: {
        en: "Been using SAPT Markets for over a year now. The customer service is exceptional, and I love the variety of products available. Highly recommend to everyone!",
        ar: "أستخدم أسواق سبت منذ أكثر من عام. خدمة العملاء ممتازة وأحب تنوع المنتجات المتاحة. أنصح الجميع بها!"
      },
      image: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
      id: 3,
      name: { en: "Fatima Al-Zahra", ar: "فاطمة الزهراء" },
      rating: 5,
      message: {
        en: "The mobile app is so user-friendly, and the delivery team is always professional. SAPT Markets has made grocery shopping stress-free for our entire family.",
        ar: "تطبيق الجوال سهل الاستخدام جدًا وفريق التوصيل دائمًا محترف. أسواق سبت جعلت التسوق للبقالة خاليًا من التوتر لعائلتنا بأكملها."
      },
      image: "https://randomuser.me/api/portraits/women/2.jpg"
    }
  ];
  const testimonials = propTestimonials && propTestimonials.length > 0 ? propTestimonials : defaultTestimonials;
  
  // Auto-advance testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setFadeDirection('out');
        setTimeout(() => {
          setActiveIndex((prevIndex) => 
            prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
          );
          setFadeDirection('in');
        }, 150);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length, isAnimating]);
  
  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setFadeDirection('out');
    setTimeout(() => {
      setActiveIndex((prevIndex) => 
        prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
      );
      setFadeDirection('in');
      setTimeout(() => setIsAnimating(false), 150);
    }, 150);
  };
  
  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setFadeDirection('out');
    setTimeout(() => {
      setActiveIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
      setFadeDirection('in');
      setTimeout(() => setIsAnimating(false), 150);
    }, 150);
  };

  const handleDotClick = (index) => {
    if (isAnimating || index === activeIndex) return;
    setIsAnimating(true);
    setFadeDirection('out');
    setTimeout(() => {
      setActiveIndex(index);
      setFadeDirection('in');
      setTimeout(() => setIsAnimating(false), 150);
    }, 150);
  };

  return (
    <div className="testimonials-section bg-white py-8 sm:py-10 md:py-12 lg:py-16">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-10">
        <div className="mb-6 sm:mb-8 md:mb-10 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
            {title || 'What Our Customers Say'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 text-center max-w-xl mx-auto">
            {description || 'Real reviews from satisfied shoppers across Saudi Arabia'}
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Testimonial Cards */}
          <div className={`testimonial-card bg-gray-50 rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-6 lg:p-10 relative overflow-hidden`}>
            <FaQuoteLeft className="text-primary text-opacity-20 text-3xl sm:text-4xl md:text-5xl lg:text-6xl absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6" />
            
            <div className={`testimonial-content flex flex-col md:flex-row items-center md:items-start space-y-3 sm:space-y-4 md:space-y-0 md:space-x-6 lg:space-x-8 pt-8 sm:pt-10 md:pt-12 transition-all duration-300 ease-in-out ${
              fadeDirection === 'out' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}>
              {/* Avatar */}
              <div className="testimonial-avatar w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gray-200 border-2 sm:border-3 md:border-4 border-white shadow-md">
                  <Image 
                    src={testimonials[activeIndex].image} 
                    alt={testimonials[activeIndex].name}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
              </div>
              
              {/* Content */}
              <div className="text-center md:text-left flex-1">
                <div className="testimonial-stars flex mb-1 sm:mb-2 justify-center md:justify-start">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={`star text-yellow-400 text-sm sm:text-base transition-all duration-200 ${i < testimonials[activeIndex].rating ? 'opacity-100 scale-100' : 'opacity-40 scale-90'}`} 
                    />
                  ))}
                </div>
                
                <p className="text-gray-700 text-sm sm:text-base md:text-lg mb-2 sm:mb-3 md:mb-4 italic leading-relaxed">"{showingTranslateValue(testimonials[activeIndex].message)}"</p>
                
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">— {showingTranslateValue(testimonials[activeIndex].name)}</h4>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Navigation Dots */}
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`testimonial-dot ${index === activeIndex ? 'active' : ''}`}
                onClick={() => handleDotClick(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Enhanced Arrow Controls */}
          <button 
            onClick={handlePrev}
            disabled={isAnimating}
            className="testimonial-nav-btn absolute top-1/2 -left-2 sm:-left-3 md:-left-4 lg:-left-12 -translate-y-1/2 text-gray-700 hover:text-gray-900"
            aria-label="Previous testimonial"
          >
            <FaChevronLeft />
          </button>
          
          <button 
            onClick={handleNext}
            disabled={isAnimating}
            className="testimonial-nav-btn absolute top-1/2 -right-2 sm:-right-3 md:-right-4 lg:-right-12 -translate-y-1/2 text-gray-700 hover:text-gray-900"
            aria-label="Next testimonial"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection; 