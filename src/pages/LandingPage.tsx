import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, Users, DollarSign, TrendingUp, ArrowRight, Shield, Zap, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Footer } from '../components/landing/Footer';
import { InterestForm } from '../components/auth/InterestForm';

const pageTransition = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMemberForm, setShowMemberForm] = useState(false);

  const handleMemberInterest = (data: any) => {
    // Handle member interest form submission
    setShowMemberForm(false);
    // You can add form handling logic here
  };

  return (
    <motion.div
      className="min-h-screen bg-white dark:bg-black"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      transition={{ duration: 0.3 }}
    >
      {/* Rest of the component remains exactly the same */}
      {/* Top Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img 
                src="/DOJOLIBRE_LOGO2.svg" 
                alt="DOJOLIBRE"
                className="h-8 w-8"
              />
              <span className="text-xl font-bold italic">
                DOJOLIBRE
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left lg:max-w-xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold mb-6"
              >
                Train Without Limits
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl mb-8"
              >
                Access any participating dojo, connect with martial artists, and track your progress.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Button
                  size="lg"
                  onClick={() => setShowMemberForm(true)}
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/partner')}
                  className="bg-orange-500 border-orange-500 text-white hover:bg-orange-600 hover:border-orange-600 transition-colors"
                >
                  Partner With Us
                  <Shield className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:w-1/2"
            >
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1920"
                alt="Martial arts training"
                className="rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Value Props */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose DOJOLIBRE?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Experience a new way of training that puts you in control of your martial arts journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: MapPin,
                title: 'Train Anywhere',
                description: 'Access any participating dojo with a single membership',
              },
              {
                icon: Users,
                title: 'Bring a Guest',
                description: 'Every member visit includes one free guest pass',
              },
              {
                icon: Zap,
                title: 'Great for Private Lessons',
                description: 'Book private lessons at any participating location',
              },
              {
                icon: TrendingUp,
                title: 'Better Experience',
                description: 'Real-time capacity tracking prevents overcrowding',
              },
              {
                icon: Shield,
                title: 'Cross Train Freely',
                description: 'Train at any location regardless of affiliation',
              },
              {
                icon: DollarSign,
                title: 'Exclusive Benefits',
                description: 'Access special discounts on supplements and gear',
              },
              {
                icon: Users,
                title: 'Connect with Others',
                description: 'Build your network and find training partners',
              },
              {
                icon: TrendingUp,
                title: 'Track Progress',
                description: 'Monitor your training metrics and attendance',
              },
            ].map((prop, index) => (
              <motion.div
                key={prop.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl"
              >
                <prop.icon className="w-8 h-8 text-indigo-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{prop.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{prop.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Training?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join the community of martial artists revolutionizing training access.
          </p>
          <Button
            size="lg"
            onClick={() => setShowMemberForm(true)}
            className="bg-white text-indigo-600 hover:bg-gray-100"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />

      {/* Member Interest Form Modal */}
      {showMemberForm && (
        <InterestForm
          type="member"
          onSubmit={handleMemberInterest}
        />
      )}
    </motion.div>
  );
}