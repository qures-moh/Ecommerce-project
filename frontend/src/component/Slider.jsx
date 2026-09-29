import { useState } from "react";

function Slider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=85",
      title: "Discover Something New",
      text: "Explore products made for your everyday style.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1800&q=85",
      title: "Fresh Styles",
      text: "Upgrade your wardrobe with our latest collection.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1800&q=85",
      title: "Shop Your Way",
      text: "Find your favorites and make them yours.",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };

  const previousSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  return (
    <section className="fashion-slider">
      <div
        className="fashion-slider-image"
        style={{
          backgroundImage: `url(${slides[currentSlide].image})`,
        }}
      >
        <div className="fashion-slider-overlay">
          <div className="fashion-slider-content">
            <h1>{slides[currentSlide].title}</h1>

            <p>{slides[currentSlide].text}</p>

            <button className="fashion-slider-button">
              Shop Now
            </button>
          </div>
        </div>

        <button
          className="fashion-slider-arrow fashion-slider-arrow-left"
          onClick={previousSlide}
          aria-label="Previous slide"
        >
          ‹
        </button>

        <button
          className="fashion-slider-arrow fashion-slider-arrow-right"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          ›
        </button>

        <div className="fashion-slider-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={
                currentSlide === index
                  ? "fashion-slider-dot fashion-slider-dot-current"
                  : "fashion-slider-dot"
              }
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Slider;