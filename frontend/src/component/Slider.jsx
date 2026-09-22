
import { useState } from "react";

function Slider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80",
      title: "Discover Something New",
      text: "Explore products made for your everyday style.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1400&q=80",
      title: "Fresh Styles",
      text: "Upgrade your wardrobe with our latest collection.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=80",
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
    <section className="slider">

      <div
        className="slider-image"
        style={{
          backgroundImage: `url(${slides[currentSlide].image})`,
        }}
      >
        <div className="slider-overlay">

          <div className="slider-content">
            <h1>{slides[currentSlide].title}</h1>

            <p>{slides[currentSlide].text}</p>

            <button>
              Shop Now
            </button>
          </div>

        </div>

        <button
          className="slider-arrow slider-prev"
          onClick={previousSlide}
        >
          ‹
        </button>

        <button
          className="slider-arrow slider-next"
          onClick={nextSlide}
        >
          ›
        </button>

        <div className="slider-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={
                currentSlide === index
                  ? "slider-dot active"
                  : "slider-dot"
              }
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

      </div>

    </section>
  );
}

export default Slider;
