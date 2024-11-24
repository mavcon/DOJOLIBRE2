import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  image?: string;
  delay?: number;
}

export function TestimonialCard({ 
  quote, 
  author, 
  role, 
  image,
  delay = 0 
}: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl"
    >
      <Quote className="w-8 h-8 text-indigo-600 mb-4" />
      <p className="text-lg mb-4">{quote}</p>
      <div className="flex items-center gap-4">
        {image ? (
          <img
            src={image}
            alt={author}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-xl font-medium text-indigo-600">
              {author[0]}
            </span>
          </div>
        )}
        <div>
          <p className="font-medium">{author}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}