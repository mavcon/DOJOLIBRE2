import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, X, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import DatePicker from 'react-datepicker';
import { mapsLoader } from '../../lib/maps';
import ReCAPTCHA from 'react-google-recaptcha';
import "react-datepicker/dist/react-datepicker.css";
import sgMail from '@sendgrid/mail';

interface InterestFormProps {
  type: 'member' | 'partner';
  onSubmit: (data: any) => void;
}

const SuccessMessage = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white dark:bg-black p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md mx-4 text-center border dark:border-gray-800"
    >
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        We've received your information and will be in touch soon. Please check your email for confirmation.
      </p>
      <Button onClick={onClose}>Close</Button>
    </motion.div>
  </motion.div>
);

export function InterestForm({ type, onSubmit }: InterestFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    dob: null as Date | null,
    area: '',
    interest: '',
    name: '',
    phone: '',
    address: '',
    matSpace: '',
    amenities: {
      showers: false,
      lockers: false,
      washrooms: false,
      changerooms: false,
    },
    acceptTerms: false,
  });

  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (type === 'partner') {
      const initAutocomplete = async () => {
        try {
          await mapsLoader.load();
          const input = document.getElementById('address-input') as HTMLInputElement;
          if (input) {
            const autocompleteInstance = new google.maps.places.Autocomplete(input, {
              types: ['address'],
            });
            setAutocomplete(autocompleteInstance);
          }
        } catch (error) {
          console.error('Error loading Google Maps:', error);
        }
      };

      initAutocomplete();
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!recaptchaToken) {
      setError('Please complete the CAPTCHA verification');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    if (type === 'member' && (!formData.dob || new Date().getFullYear() - formData.dob.getFullYear() < 13)) {
      setError('You must be at least 13 years old to sign up');
      return;
    }

    try {
      // Send confirmation email to user
      await sgMail.send({
        to: formData.email,
        from: 'noreply@dojolibre.com',
        subject: `Thank you for your interest in DojoLibre ${type === 'partner' ? 'Partnership' : 'Membership'}`,
        text: `Thank you for your interest in DojoLibre! We've received your information and will be in touch soon.`,
        html: `
          <h1>Thank you for your interest in DojoLibre!</h1>
          <p>We've received your information and will be in touch soon.</p>
        `,
      });

      // Send notification email to admin
      await sgMail.send({
        to: 'admin@dojolibre.com',
        from: 'noreply@dojolibre.com',
        subject: `New ${type === 'partner' ? 'Partner' : 'Member'} Interest Form Submission`,
        text: JSON.stringify(formData, null, 2),
        html: `
          <h1>New ${type === 'partner' ? 'Partner' : 'Member'} Interest Form Submission</h1>
          <pre>${JSON.stringify(formData, null, 2)}</pre>
        `,
      });

      setShowSuccess(true);
      onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  if (showSuccess) {
    return <SuccessMessage onClose={() => onSubmit(null)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onSubmit(null);
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-black p-4 sm:p-8 rounded-lg shadow-xl w-full max-w-md mx-auto my-4 sm:my-8 border dark:border-gray-800 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-black pt-2">
          <h2 className="text-xl sm:text-2xl font-bold">
            {type === 'member' ? 'Get Early Access' : 'Partner With Us'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSubmit(null)}
            className="absolute right-2 top-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto px-1">
          {/* Rest of the form JSX remains exactly the same */}
          {type === 'member' ? (
            <>
              <div className="form-group">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                  className="peer w-full"
                  required
                />
                <label>Email</label>
              </div>

              <div className="form-group">
                <DatePicker
                  selected={formData.dob}
                  onChange={(date) => setFormData({ ...formData, dob: date })}
                  dateFormat="MM/dd/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  placeholderText="Date of Birth"
                  className="peer w-full"
                  maxDate={new Date()}
                  required
                />
                <label>Date of Birth</label>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="Area to Train"
                  className="peer w-full"
                  required
                />
                <label>Area to Train</label>
              </div>

              <div className="form-group">
                <textarea
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  placeholder="What excites you about DojoLibre?"
                  className="peer w-full resize-none"
                  rows={3}
                  required
                />
                <label>What excites you about DojoLibre?</label>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contact Name"
                  className="peer w-full"
                  required
                />
                <label>Contact Name</label>
              </div>

              <div className="form-group">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                  className="peer w-full"
                  required
                />
                <label>Email</label>
              </div>

              <div className="form-group">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone"
                  className="peer w-full"
                  required
                />
                <label>Phone</label>
              </div>

              <div className="form-group">
                <input
                  id="address-input"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Dojo/Gym Address"
                  className="peer w-full"
                  required
                />
                <label>Dojo/Gym Address</label>
              </div>

              <div className="form-group">
                <input
                  type="number"
                  value={formData.matSpace}
                  onChange={(e) => setFormData({ ...formData, matSpace: e.target.value })}
                  placeholder="Total Mat Space (sq ft)"
                  className="peer w-full"
                  required
                />
                <label>Total Mat Space (sq ft)</label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Available Amenities</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(formData.amenities).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            amenities: {
                              ...formData.amenities,
                              [key]: e.target.checked,
                            },
                          })
                        }
                      />
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-4 sticky bottom-0 bg-white dark:bg-black pt-4">
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={setRecaptchaToken}
                theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
              />
            </div>

            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="mt-1"
              />
              <span className="text-sm">
                I agree to receive updates about the beta program and app launch. By signing up,
                I accept the{' '}
                <a
                  href="/terms"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  target="_blank"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  target="_blank"
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">
              Submit Interest
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}