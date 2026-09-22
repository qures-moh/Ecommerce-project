import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
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

  const baseURL =
    api.defaults.baseURL ||
    "http://localhost:3000/api";

  const cleanBaseURL = baseURL.replace(
    /\/api\/?$/,
    ""
  );

  const cleanImage = image
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  return `${cleanBaseURL}/${cleanImage}`;
};

export default function SubcategoryPage() {
  const { categoryId } = useParams();

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          categoryResponse,
          subcategoryResponse,
        ] = await Promise.all([
          api.get(
            `/categories/${categoryId}`
          ),
          api.get(
            `/subcategories/category/${categoryId}`
          ),
        ]);

        setCategory(
          categoryResponse.data?.category ||
            null
        );

        const subcategoryData =
          subcategoryResponse.data
            ?.subcategories || [];

        setSubcategories(
          Array.isArray(subcategoryData)
            ? subcategoryData
            : []
        );
      } catch (error) {
        console.error(
          "FAILED TO FETCH SUBCATEGORIES:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load subcategories"
        );
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchSubcategories();
    }
  }, [categoryId]);

  if (loading) {
    return (
      <section className="subcategory-page">
        <div className="subcategory-container">
          <div className="subcategory-loading">
            <div className="subcategory-loader"></div>
            <p>
              Loading subcategories...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="subcategory-page">
        <div className="subcategory-container">
          <div className="subcategory-error">
            <div className="subcategory-error-icon">
              !
            </div>

            <h2>
              Something went wrong
            </h2>

            <p>{error}</p>

            <Link
              to="/categories"
              className="subcategory-back"
            >
              <ArrowLeft size={17} />
              Back to Categories
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="subcategory-page">
      <div className="subcategory-container">
        <div className="subcategory-breadcrumb">
          <Link to="/">
            Home
          </Link>

          <ChevronRight size={15} />

          <Link to="/categories">
            Categories
          </Link>

          <ChevronRight size={15} />

          <span>
            {category?.name ||
              "Category"}
          </span>
        </div>

        <Link
          to="/categories"
          className="subcategory-back"
        >
          <ArrowLeft size={17} />
          Back
        </Link>

        <div className="subcategory-heading">
          <div className="subcategory-heading-content">
            <span className="subcategory-eyebrow">
              SUBCATEGORY
            </span>

            <h1>
              {category?.name ||
                "Category"}
            </h1>

            {category?.description && (
              <p>
                {category.description}
              </p>
            )}
          </div>

          <div className="subcategory-count">
            <strong>
              {subcategories.length}
            </strong>

            <span>
              {subcategories.length ===
              1
                ? "Subcategory"
                : "Subcategories"}
            </span>
          </div>
        </div>

        {subcategories.length ===
        0 ? (
          <div className="subcategory-empty">
            <div className="subcategory-empty-icon">
              <span></span>
            </div>

            <h2>
              No subcategories available
            </h2>

            <p>
              There are currently no
              subcategories in this
              category.
            </p>

            <Link
              to="/categories"
              className="subcategory-empty-button"
            >
              <ArrowLeft size={17} />
              Back to Categories
            </Link>
          </div>
        ) : (
          <div className="subcategory-grid">
            {subcategories.map(
              (subcategory) => {
                const imageUrl =
                  getImageUrl(
                    subcategory.image
                  );

                return (
                  <Link
                    key={subcategory._id}
                    to={`/categories/${categoryId}/subcategories/${subcategory._id}`}
                    className="subcategory-card"
                  >
                    <div className="subcategory-image">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={
                            subcategory.name
                          }
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";

                            const parent =
                              e.currentTarget
                                .parentElement;

                            if (
                              parent &&
                              !parent.querySelector(
                                ".subcategory-no-image"
                              )
                            ) {
                              const div =
                                document.createElement(
                                  "div"
                                );

                              div.className =
                                "subcategory-no-image";

                              div.textContent =
                                "No Image";

                              parent.insertBefore(
                                div,
                                parent.firstChild
                              );
                            }
                          }}
                        />
                      ) : (
                        <div className="subcategory-no-image">
                          No Image
                        </div>
                      )}

                      <div className="subcategory-card-arrow">
                        <ArrowRight
                          size={18}
                        />
                      </div>
                    </div>

                    <div className="subcategory-card-content">
                      <div className="subcategory-card-text">
                        <h3>
                          {
                            subcategory.name
                          }
                        </h3>

                        {subcategory.description && (
                          <p>
                            {
                              subcategory.description
                            }
                          </p>
                        )}
                      </div>

                      <ArrowRight
                        className="subcategory-mobile-arrow"
                        size={19}
                      />
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        )}
      </div>
    </section>
  );
}