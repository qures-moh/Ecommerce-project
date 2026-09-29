import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <div className="not-found-number">404</div>

        <h1>Page Not Found</h1>

        <p>
          Sorry, the page you're looking for doesn't exist or may have been
          moved.
        </p>

        <div className="not-found-actions">
          <button
            onClick={() => window.history.back()}
            className="back-button"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <Link to="/" className="home-button">
            <Home size={18} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;