import { useState } from "react";

const faqs = [
  {
    question: "What is Arogya?",
    answer:
      "Arogya is a healthcare app designed to help you track symptoms, manage medications, and receive AI-driven health recommendations.",
  },
  {
    question: "Is Arogya free to use?",
    answer:
      "Yes, Arogya offers a free plan with essential features. Premium plans are available for advanced features.",
  },
  {
    question: "Can I ztrack my medication reminders?",
    answer:
      "Absolutely! Arogya allows you to set medication reminders and manage prescriptions easily.",
  },
  {
    question: "Does Arogya provide AI health recommendations?",
    answer:
      "Yes, Arogya offers AI-based personalized health tips based on your symptoms and medical history.",
  },
];

export default function Faqs() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="py-16">
      <div className="max-w-4xl mx-auto px-6 text-center mt-10">
        <h2 className="text-3xl font-bold text-[#1FBCF9]">
          Frequently Asked Questions
        </h2>

        <p className="text-gray-400 mt-3">
          Find answers to common questions about Arogya.
        </p>

        <div className="mt-8 space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-2 border-white/15 shadow-md rounded-lg p-5 text-left cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">
                  {faq.question}
                </h3>

                <span className="text-gray-500">
                  {openIndex === index ? "▲" : "▼"}
                </span>
              </div>

              {openIndex === index && (
                <p className="mt-2 text-white">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
