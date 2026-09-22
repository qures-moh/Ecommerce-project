import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios";

const getImageUrl = (image) => {
  if (!image || typeof image !== "string") {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  const baseUrl =
    api.defaults.baseURL?.replace(
      /\/api\/?$/,
      ""
    ) || "http://localhost:3000";

  const cleanImage = image
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  return `${baseUrl}/${cleanImage}`;
};

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/categories"
        );

        setCategories(
          response.data?.categories || []
        );
      } catch (error) {
        console.error(
          "Failed to fetch categories:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load categories"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="category-section">
        <div className="category-container">
          <div className="category-message">
            <p>Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="category-section">
        <div className="category-container">
          <div className="category-message">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="category-section">
      <div className="category-container">
        <div className="category-heading">
          <div>
            <p className="category-eyebrow">
              SHOP BY CATEGORY
            </p>

            <h2>Explore Categories</h2>
          </div>

          <p className="category-heading-description">
            Find everything you need from our wide
            range of categories.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="category-message">
            <p>No categories available.</p>
          </div>
        ) : (
          <div className="category-grid">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/categories/${category._id}`}
                className="category-card"
              >
                <div className="category-image-wrapper">
                  {category.image ? (
                    <img
                      className="category-image"
                      src={getImageUrl(
                        category.image
                      )}
                      alt={category.name}
                    />
                  ) : (
                    <div className="category-image-empty">
                      No Image
                    </div>
                  )}

                  <div className="category-overlay">
                    <span>
                      View Category
                    </span>
                  </div>
                </div>

                <div className="category-card-content">
                  <div className="category-card-info">
                    <h3>{category.name}</h3>

                    <span>
                      {category.productCount || 0}{" "}
                      {category.productCount === 1
                        ? "Product"
                        : "Products"}
                    </span>
                  </div>

                  <div className="category-arrow">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}