import React from 'react';
import { Button } from '../ui/Button';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { motion } from 'framer-motion';

interface CheckInOutButtonProps {
  locationId: string;
  isProcessing: boolean;
  onCheckInOut: (locationId: string) => void;
  variant?: 'default' | 'bubble';
  className?: string;
}

export function CheckInOutButton({ 
  locationId, 
  isProcessing, 
  onCheckInOut,
  variant = 'default',
  className = ''
}: CheckInOutButtonProps) {
  const currentUser = useAuthStore(state => state.user);
  const { isCheckedIn } = useAttendanceStore();

  // Only show check-in/out for members
  if (!currentUser || currentUser.role !== 'MEMBER') {
    return null;
  }

  const userCheckedInHere = isCheckedIn(currentUser.id) === locationId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCheckInOut(locationId);
  };

  if (variant === 'bubble') {
    return (
      <motion.button 
        onClick={handleClick}
        disabled={isProcessing}
        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          userCheckedInHere 
            ? 'bg-transparent border-2 border-green-500 text-green-600 hover:bg-green-50'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        } ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''} ${className}`}
        whileTap={{ scale: 0.95 }}
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : (
          userCheckedInHere ? 'Check Out' : 'Check In'
        )}
      </motion.button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant={userCheckedInHere ? 'outline' : 'default'}
      className={`flex items-center gap-2 min-w-[100px] justify-center ${
        userCheckedInHere ? 'border-green-500 text-green-600' : ''
      } ${className}`}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        userCheckedInHere ? 'Check Out' : 'Check In'
      )}
    </Button>
  );
}