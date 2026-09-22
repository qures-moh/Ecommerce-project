import {
  ShoppingBag,
  MapPin,
  Phone,
} from "lucide-react";



export default function Footer() {
  return (
    <footer className="shoply-footer">
      <div className="shoply-footer-container">

        <div className="shoply-footer-brand">
          <div className="shoply-footer-logo">
            <div className="shoply-footer-logo-icon">
              <ShoppingBag size={22} />
            </div>

            <span>Shoply</span>
          </div>

          <p>
            Your simple online shopping destination.
          </p>
        </div>

        <div className="shoply-footer-section">
          <h3>Quick Links</h3>

          <p>Home</p>
          <p>Products</p>
          <p>Cart</p>
          <p>Wishlist</p>
        </div>

        <div className="shoply-footer-section">
          <h3>Contact</h3>

          <div className="shoply-footer-contact">
            <MapPin size={18} />
            <span>Ujjain, Madhya Pradesh</span>
          </div>

          <div className="shoply-footer-contact">
            <Phone size={18} />
            <span>9179595991</span>
          </div>
        </div>

      </div>

      <div className="shoply-footer-bottom">
        <p>© 2026 Shoply. All rights reserved.</p>
      </div>
    </footer>
  );
}