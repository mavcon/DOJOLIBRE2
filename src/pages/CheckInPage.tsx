import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAttendanceStore } from '../store/attendanceStore';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

type CheckStatus = 'idle' | 'processing' | 'success' | 'error';

export function CheckInPage() {
  const [status, setStatus] = useState<CheckStatus>('idle');
  const location = useLocation();
  const navigate = useNavigate();
  const locationId = location.state?.locationId;
  const user = useAuthStore(state => state.user);
  const { checkIn, checkOut, isCheckedIn } = useAttendanceStore();

  const currentLocationId = user ? isCheckedIn(user.id) : null;
  const isCheckingOut = currentLocationId === locationId;

  useEffect(() => {
    if (!locationId || !user) {
      navigate('/locations');
    }
  }, [locationId, user, navigate]);

  const handleCheckInOut = async () => {
    if (!user || !locationId) return;

    setStatus('processing');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (isCheckingOut) {
        checkOut(user.id, locationId);
      } else {
        checkIn(user.id, locationId);
      }

      setStatus('success');
      
      // Auto-navigate back after success
      setTimeout(() => {
        navigate('/locations');
      }, 2000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/locations')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Locations
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-8 text-center"
      >
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold">
                {isCheckingOut ? 'Ready to leave?' : 'Welcome!'}
              </h2>
              <p className="text-gray-600">
                {isCheckingOut
                  ? 'Tap the button below to check out'
                  : 'Tap the button below to check in'}
              </p>
              <Button
                onClick={handleCheckInOut}
                size="lg"
                className="w-full py-6 text-lg"
              >
                {isCheckingOut ? 'Check Out' : 'Check In'}
              </Button>
            </motion.div>
          )}

          {status === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-8"
            >
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto" />
              <p className="text-lg mt-4">
                {isCheckingOut ? 'Checking out...' : 'Checking in...'}
              </p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              </motion.div>
              <p className="text-lg mt-4 text-green-600">
                {isCheckingOut ? 'Successfully checked out!' : 'Successfully checked in!'}
              </p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              </motion.div>
              <p className="text-lg mt-4 text-red-600">
                Something went wrong. Please try again.
              </p>
              <Button
                variant="outline"
                onClick={() => setStatus('idle')}
                className="mt-4"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}