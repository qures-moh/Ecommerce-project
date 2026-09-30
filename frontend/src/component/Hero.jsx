import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  Tag,
  Star,
} from "lucide-react";

export default function Hero() {
  return (
    <>
      <section className="jbw-hero">
        <div className="jbw-hero-media">
          <img
            src="/hero.avif"
            alt="Designer clothing collection"
            className="jbw-hero-image"
          />

          <div className="jbw-hero-overlay"></div>

          <div className="jbw-hero-content-panel">
            <div className="jbw-hero-content">
              <h1 className="jbw-hero-title">
                YOUR STYLE,
                <br />
                YOUR MOMENT.
              </h1>

              <p className="jbw-hero-text">
                Fashion Designer, Rented Dress & Rented Jewellery
                Booking App. Exclusive access to the world's most
                coveted wardrobes.
              </p>

              <Link
                to="/products"
                className="jbw-hero-button"
              >
                BOOK YOUR LOOK
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="jbw-features">
        <div className="jbw-feature">
          <div className="jbw-feature-icon">
            <ShieldCheck size={22} />
          </div>

          <div className="jbw-feature-info">
            <h3>Verified boutiques</h3>
            <p>Curated designer partners</p>
          </div>
        </div>

        <div className="jbw-feature">
          <div className="jbw-feature-icon">
            <Truck size={22} />
          </div>

          <div className="jbw-feature-info">
            <h3>Doorstep delivery</h3>
            <p>Per-vendor at checkout</p>
          </div>
        </div>

        <div className="jbw-feature">
          <div className="jbw-feature-icon">
            <Tag size={22} />
          </div>

          <div className="jbw-feature-info">
            <h3>Designer rentals</h3>
            <p>Outfits & jewellery</p>
          </div>
        </div>

        <div className="jbw-feature">
          <div className="jbw-feature-icon">
            <Star size={22} />
          </div>

          <div className="jbw-feature-info">
            <h3>4.1★ rated</h3>
            <p>From 18 customer reviews</p>
          </div>
        </div>
      </section>
    </>
  );
}