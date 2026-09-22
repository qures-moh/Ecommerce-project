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
      <section className="jbi-hero">
        <div className="jbi-hero-image">
          <div className="jbi-hero-overlay"></div>

          <div className="jbi-hero-content">
            <h1>
              YOUR STYLE,
              <br />
              YOUR MOMENT.
            </h1>

            <p>
              Fashion Designer, Rented Dress & Rented Jewellery
              Booking App. Exclusive access to the world's most
              coveted wardrobes.
            </p>

            <Link
              to="/catalog"
              className="jbi-hero-button"
            >
              BOOK YOUR LOOK
            </Link>
          </div>
        </div>
      </section>

      <section className="jbi-features">
        <div className="jbi-feature">
          <div className="jbi-feature-icon">
            <ShieldCheck size={22} />
          </div>

          <div className="jbi-feature-content">
            <h3>Verified boutiques</h3>
            <p>Curated designer partners</p>
          </div>
        </div>

        <div className="jbi-feature">
          <div className="jbi-feature-icon">
            <Truck size={22} />
          </div>

          <div className="jbi-feature-content">
            <h3>Doorstep delivery</h3>
            <p>Per-vendor at checkout</p>
          </div>
        </div>

        <div className="jbi-feature">
          <div className="jbi-feature-icon">
            <Tag size={22} />
          </div>

          <div className="jbi-feature-content">
            <h3>Designer rentals</h3>
            <p>Outfits & jewellery</p>
          </div>
        </div>

        <div className="jbi-feature">
          <div className="jbi-feature-icon">
            <Star size={22} />
          </div>

          <div className="jbi-feature-content">
            <h3>4.1★ rated</h3>
            <p>From 18 customer reviews</p>
          </div>
        </div>
      </section>
    </>
  );
}