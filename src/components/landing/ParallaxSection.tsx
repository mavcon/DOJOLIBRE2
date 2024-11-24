import React from 'react';
import { Parallax } from 'react-parallax';
import { motion } from 'framer-motion';

interface ParallaxSectionProps {
  image: string;
  strength?: number;
  children: React.ReactNode;
  className?: string;
}

export function ParallaxSection({ 
  image, 
  strength = 200,
  children,
  className = ''
}: ParallaxSectionProps) {
  return (
    <Parallax
      bgImage={image}
      strength={strength}
      className={`relative ${className}`}
      renderLayer={(percentage) => (
        <div
          style={{
            position: 'absolute',
            background: `rgba(0, 0, 0, ${0.5 + percentage * 0.2})`,
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
          }}
        />
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </Parallax>
  );
}