import { useState } from "react";
import { ChevronDown } from "lucide-react";


const faqData = [
  {
    question: "What is Just Book It?",
    answer:
      "Just Book It is a fashion booking platform where you can discover and book fashion designers, rented dresses, and rented jewellery from available vendors.",
  },
  {
    question: "How can I book a fashion designer?",
    answer:
      "Browse the available fashion designers, open the designer or service you are interested in, select the required details, and continue with the booking process.",
  },
  {
    question: "Can I rent dresses through Just Book It?",
    answer:
      "Yes. You can browse available rented dresses, check their details and proceed with a booking based on the availability provided by the vendor.",
  },
  {
    question: "Can I rent jewellery?",
    answer:
      "Yes. Just Book It also provides rented jewellery listings where you can explore available jewellery and make a booking.",
  },
  {
    question: "How do I search for a product?",
    answer:
      "Use the search bar in the navigation bar and enter the product or service you are looking for. Matching products will be displayed as you type.",
  },
  {
    question: "How can I check my orders?",
    answer:
      "After signing in, open the Orders section from the navigation bar to view your bookings and order details.",
  },
  {
    question: "Can I add products to my wishlist?",
    answer:
      "Yes. You can click the wishlist icon on supported products to save them for later. Your saved wishlist items can be accessed from the wishlist section.",
  },
  {
    question: "How do I change my location?",
    answer:
      "Click the location selector in the navigation bar and choose a city from the available locations or search for a city or state.",
  },
  {
    question: "Do I need an account to place an order?",
    answer:
      "You need to be signed in to access account-based features such as orders, wishlist, cart and booking-related functionality.",
  },
  {
    question: "How can I contact support?",
    answer:
      "For assistance with your booking or account, use the contact information provided in the website footer.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex((current) =>
      current === index ? null : index
    );
  };

  return (
    <main className="jbw-faq-page">
      <section className="jbw-faq-hero">
        <span className="jbw-faq-eyebrow">
          HELP & SUPPORT
        </span>

        <h1 className="jbw-faq-title">
          Frequently Asked
          <br />
          <span>Questions.</span>
        </h1>

        <p className="jbw-faq-intro">
          Find answers to common questions about bookings,
          rentals, products and your Just Book It account.
        </p>
      </section>

      <section className="jbw-faq-section">
        <div className="jbw-faq-container">
          <div className="jbw-faq-heading">
            <span>FAQ</span>
            <h2>How can we help?</h2>
          </div>

          <div className="jbw-faq-list">
            {faqData.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  className={`jbw-faq-item ${
                    isOpen ? "jbw-faq-item-open" : ""
                  }`}
                  key={faq.question}
                >
                  <button
                    type="button"
                    className="jbw-faq-question"
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>

                    <span className="jbw-faq-icon">
                      <ChevronDown
                        size={20}
                      />
                    </span>
                  </button>

                  <div
                    className={`jbw-faq-answer ${
                      isOpen ? "jbw-faq-answer-open" : ""
                    }`}
                  >
                    <p>{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}