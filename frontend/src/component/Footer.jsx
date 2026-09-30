import { Link } from "react-router-dom";



export default function Footer() {
  return (
    <footer className="jbw-footer">
      <div className="jbw-footer-container">
        <div className="jbw-footer-main">

          <div className="jbw-footer-brand">
            <Link to="/" className="jbw-footer-logo-link">
              <img
                src="/Just-book.png"
                alt="Just Book It"
                className="jbw-footer-logo"
              />
            </Link>

            <p className="jbw-footer-description">
              India's premier destination for designer
              <br />
              dresses and jewellery rentals. Look
              <br />
              extraordinary for any occasion.
            </p>
          </div>

          <div className="jbw-footer-column">
            <h3>QUICK LINKS</h3>

            <Link to="/categories">Browse Categories</Link>
            <Link to="/faq">FAQs</Link>
            <Link to="/orders">My Bookings</Link>
            <Link to="/profile">Contact Us</Link>
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>

          <div className="jbw-footer-column">
            <h3>SERVICES</h3>

            <Link to="/categories">Fashion Designer</Link>
            <Link to="/categories">Rented Dress</Link>
            <Link to="/categories">Rented Jewellery</Link>
          </div>

          <div className="jbw-footer-column jbw-footer-connect">
            <h3>CONNECT</h3>

            <div className="jbw-footer-socials">
              <a
                href="#"
                aria-label="Instagram"
                className="jbw-social-instagram"
              >
              
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="jbw-social-facebook"
              >
                f
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="jbw-social-youtube"
              >
                ▶
              </a>
            </div>
          </div>

        </div>

        <div className="jbw-footer-bottom">
          <p>© 2026 Just Book It. All rights reserved.</p>

          <div className="jbw-footer-bottom-links">
            <Link to="/terms">Terms</Link>
            <span>•</span>
            <Link to="/privacy">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}