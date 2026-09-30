
import { Scissors, Shirt, Gem } from "lucide-react";
const qrImage =
  "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fjust-bookeit.developmentalphawizz.com";
const appImage =
  "https://just-bookeit.developmentalphawizz.com/images/app-band-visual.png";

export default function AppShowcase() {
  return (
    <section className="jbw-app-showcase">
      <div className="jbw-app-showcase-container">
        <div className="jbw-app-showcase-content">
          <div className="jbw-app-showcase-left">
            <img
              src="/Just-book.png"
              alt="Just Book It"
              className="jbw-app-showcase-logo"
            />

            <h2 className="jbw-app-showcase-title">
              FASHION. STYLE.
              <br />
              <span>BOOKED.</span>
            </h2>

            <div className="jbw-app-showcase-line"></div>

            <p className="jbw-app-showcase-description">
              Your go-to app for booking Fashion Designers,
              <br className="jbw-desktop-break" />
              Rented Dresses & Rented Jewellery.
            </p>

            <div className="jbw-app-services">
              <div className="jbw-app-service">
                <Scissors size={19} />
                <span>
                  FASHION DESIGNER
                  <br />
                  BOOKING
                </span>
              </div>

              <div className="jbw-app-service">
                <Shirt size={19} />
                <span>
                  RENTED DRESS
                  <br />
                  BOOKING
                </span>
              </div>

              <div className="jbw-app-service">
                <Gem size={19} />
                <span>
                  RENTED JEWELLERY
                  <br />
                  BOOKING
                </span>
              </div>
            </div>

            <div className="jbw-app-download">
             <div className="jbw-app-qr">
  <img
    src={qrImage}
    alt="Download Just Book It app"
  />
</div>

              <div className="jbw-app-download-text">
                <strong>DOWNLOAD</strong>
                <strong>THE APP NOW!</strong>
                <span>Book. Wear. Shine.</span>
              </div>

              <div className="jbw-app-store-buttons">
                <a href="#" className="jbw-store-button">
                  <span className="jbw-store-icon"></span>

                  <span>
                    <small>Download on the</small>
                    App Store
                  </span>
                </a>

                <a href="#" className="jbw-store-button">
                  <span className="jbw-play-icon">▶</span>

                  <span>
                    <small>Get it on</small>
                    Google Play
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className="jbw-app-showcase-right">
            <img
              src={appImage}
              alt="Just Book It mobile application"
              className="jbw-app-showcase-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
}