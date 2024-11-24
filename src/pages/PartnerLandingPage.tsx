import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, BarChart2, Users, DollarSign, QrCode, Clock, Shield, ArrowRight, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Footer } from '../components/landing/Footer';
import { InterestForm } from '../components/auth/InterestForm';

const pageTransition = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

export function PartnerLandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPartnerForm, setShowPartnerForm] = useState(false);

  const handlePartnerInterest = (data: any) => {
    setShowPartnerForm(false);
    // Handle partner form submission
  };

  return (
    <motion.div
      className="h-screen overflow-x-hidden overflow-y-auto bg-white dark:bg-black"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col min-h-screen">
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

        <main className="flex-grow">
          {/* Hero Section */}
          <header className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="text-center lg:text-left lg:max-w-xl">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold mb-6"
                  >
                    Grow Your Dojo Community
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl mb-8"
                  >
                    Join our network of dojos and expand your reach while maintaining complete control of your space.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                  >
                    <Button
                      size="lg"
                      onClick={() => navigate('/')}
                      className="bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back to Members
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => setShowPartnerForm(true)}
                      className="bg-white text-orange-600 hover:bg-gray-100"
                    >
                      Become a Partner
                      <ArrowRight className="w-5 h-5 ml-2" />
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
                    src="https://images.unsplash.com/photo-1581509363533-f41d5f0f0a5f?auto=format&fit=crop&q=80&w=1920"
                    alt="Dojo interior"
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
                <h2 className="text-3xl font-bold mb-4">Partner Benefits</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Discover how partnering with DOJOLIBRE can help grow your dojo while maintaining your independence.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: Users,
                    title: 'Expand Your Reach',
                    description: 'Access a growing network of martial artists looking for training spaces',
                  },
                  {
                    icon: Building2,
                    title: 'Full Control',
                    description: 'Maintain complete control over your space, schedule, and capacity',
                  },
                  {
                    icon: DollarSign,
                    title: 'Additional Revenue',
                    description: 'Generate extra income from visiting members without fixed commitments',
                  },
                  {
                    icon: BarChart2,
                    title: 'Real-time Analytics',
                    description: 'Track attendance, peak hours, and member engagement metrics',
                  },
                  {
                    icon: QrCode,
                    title: 'Easy Check-ins',
                    description: 'Streamlined entry process with unique QR codes for each location',
                  },
                  {
                    icon: Clock,
                    title: 'Flexible Hours',
                    description: 'Set and modify your available hours and capacity limits',
                  },
                  {
                    icon: Shield,
                    title: 'Verified Partners',
                    description: 'Join a network of verified martial arts facilities',
                  },
                  {
                    icon: MapPin,
                    title: 'Location Management',
                    description: 'Manage multiple locations from a single dashboard',
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
                    <prop.icon className="w-8 h-8 text-orange-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{prop.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{prop.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Join Our Network?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Partner with us and become part of the future of martial arts training.
              </p>
              <Button
                size="lg"
                onClick={() => setShowPartnerForm(true)}
                className="bg-white text-orange-600 hover:bg-gray-100"
              >
                Become a Partner Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      {/* Partner Interest Form Modal */}
      {showPartnerForm && (
        <InterestForm
          type="partner"
          onSubmit={handlePartnerInterest}
        />
      )}
    </motion.div>
  );
}