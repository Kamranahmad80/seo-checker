"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "SEO Sensei helped us identify critical SEO issues we missed for months. Our organic traffic increased by 38% after implementing their suggestions.",
    author: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechStart Inc."
  },
  {
    quote: "The GitHub repo scanner is a game-changer for our development workflow. We now catch SEO problems before they even make it to production.",
    author: "Michael Chen",
    role: "Lead Developer",
    company: "CodeCraft Solutions"
  },
  {
    quote: "The AI-powered suggestions are incredibly accurate. It's like having an SEO expert on our team 24/7.",
    author: "Emma Rodriguez",
    role: "E-commerce Manager",
    company: "Retail Innovations"
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join hundreds of websites already improving their search engine rankings
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600 dark:text-blue-400">
                  <path d="M14.017 21V14.25C14.017 10.67 17.04 7.75 20.75 7.75V14.5C20.75 18.08 17.73 21 14.017 21ZM3 21V14.25C3 10.67 6.024 7.75 9.733 7.75V14.5C9.733 18.08 6.71 21 3 21Z" fill="currentColor"/>
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 italic">"{testimonial.quote}"</p>
              <div>
                <p className="font-bold">{testimonial.author}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{testimonial.role}, {testimonial.company}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
