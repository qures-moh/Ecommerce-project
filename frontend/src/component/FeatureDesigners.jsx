
const designers = [
  {
    id: 1,
    name: "Amay Singh",
    image:
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 2,
    name: "Bond House",
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 3,
    name: "Shivshakti Textile Co",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 4,
    name: "Alphawizz",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 5,
    name: "Wide Rentals",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 6,
    name: "Pokemon House",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 7,
    name: "Alpha Fashion",
    image:
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 8,
    name: "Aura Fashion",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=300&q=80",
  },
];

function FeaturedDesigners() {
  const sliderDesigners = [...designers, ...designers];

  return (
    <section className="jbw-featured-designers">
      <div className="jbw-featured-container">
        <h2 className="jbw-featured-title">
          Featured Designers
        </h2>

        <div className="jbw-featured-slider">
          <div className="jbw-featured-track">
            {sliderDesigners.map((designer, index) => (
              <div
                className="jbw-designer-card"
                key={`${designer.id}-${index}`}
              >
                <div className="jbw-designer-image-wrapper">
                  <img
                    src={designer.image}
                    alt={designer.name}
                    className="jbw-designer-image"
                  />
                </div>

                <h3 className="jbw-designer-name">
                  {designer.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedDesigners;