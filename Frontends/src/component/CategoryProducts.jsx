import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import api from "../utils/axios";


const CategoryProducts = () => {
  const { id } = useParams();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getImageUrl = (image) => {
    if (!image) return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    const baseUrl = api.defaults.baseURL?.replace(
      /\/api\/?$/,
      ""
    );

    const cleanImage = image
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    return `${baseUrl}/${cleanImage}`;
  };

  const getDiscountedPrice = (product) => {
    const price = Number(product.price) || 0;
    const discountValue =
      Number(product.discountValue) || 0;

    if (
      product.discountType === "percentage" &&
      discountValue > 0
    ) {
      return Math.max(
        0,
        price - (price * discountValue) / 100
      );
    }

    if (
      product.discountType === "flat" &&
      discountValue > 0
    ) {
      return Math.max(0, price - discountValue);
    }

    return price;
  };

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/categories/${id}/products`
        );

        setCategory(response.data.category);
        setProducts(response.data.products || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [id]);

  if (loading) {
    return (
      <section className="category-products">
        <div className="category-products-container">
          <div className="category-products-loading">
            Loading products...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="category-products">
        <div className="category-products-container">
          <div className="category-products-error">
            <h2>Something went wrong</h2>
            <p>{error}</p>

            <Link
              to="/"
              className="category-products-back"
            >
              <ArrowLeft size={17} />
              Back
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="category-products">
      <div className="category-products-container">
        <Link
          to="/"
          className="category-products-back"
        >
          <ArrowLeft size={17} />
          Back
        </Link>

        <div className="category-products-heading">
          <span>CATEGORY</span>

          <h1>{category?.name}</h1>

          {category?.description && (
            <p>{category.description}</p>
          )}

          <div className="category-products-count">
            {products.length}{" "}
            {products.length === 1
              ? "Product"
              : "Products"}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="category-products-empty">
            <ShoppingBag size={45} />

            <h2>No products available</h2>

            <p>
              There are currently no products in this
              category.
            </p>
          </div>
        ) : (
          <div className="category-products-grid">
            {products.map((product) => {
              const finalPrice =
                getDiscountedPrice(product);

              const hasDiscount =
                finalPrice < Number(product.price);

              return (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="category-product-card"
                >
                  <div className="category-product-image">
                    {product.image ? (
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                      />
                    ) : (
                      <div className="category-product-no-image">
                        <ShoppingBag size={30} />
                      </div>
                    )}

                    {hasDiscount && (
                      <span className="category-product-discount">
                        {product.discountType ===
                        "percentage"
                          ? `${product.discountValue}% OFF`
                          : `₹${product.discountValue} OFF`}
                      </span>
                    )}

                    {product.stock === 0 && (
                      <span className="category-product-stock">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <div className="category-product-info">
                    <h3>{product.name}</h3>

                    <span>
                      {product.category}
                    </span>

                    <div className="category-product-price">
                      <strong>
                        ₹
                        {finalPrice.toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                      {hasDiscount && (
                        <del>
                          ₹
                          {Number(
                            product.price
                          ).toLocaleString("en-IN")}
                        </del>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryProducts;