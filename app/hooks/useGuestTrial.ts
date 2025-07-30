import { useState, useEffect, useCallback } from 'react';

interface GuestTrialData {
  weekStartDate: string;
  timeUsedThisWeek: number; // in seconds
  lastUsedDate: string;
  isActive: boolean;
}

const TRIAL_LIMIT_MINUTES = 3;
const TRIAL_LIMIT_SECONDS = TRIAL_LIMIT_MINUTES * 60; // 180 seconds
const STORAGE_KEY = 'redcreativa_guest_trial_data';

export function useGuestTrial() {
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(TRIAL_LIMIT_SECONDS);
  const [isTrialActive, setIsTrialActive] = useState<boolean>(false);
  const [isTrialExpired, setIsTrialExpired] = useState<boolean>(false);
  const [canStartTrial, setCanStartTrial] = useState<boolean>(true);

  // Get the start of the current week (Monday)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const initializeGuestTrial = useCallback(() => {
    const now = new Date();
    const currentWeekStart = getWeekStart(now).toISOString();
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    let trialData: GuestTrialData;
    
    if (storedData) {
      trialData = JSON.parse(storedData);
      
      // Check if it's a new week
      const storedWeekStart = new Date(trialData.weekStartDate);
      const currentWeekStartDate = new Date(currentWeekStart);
      
      if (storedWeekStart.getTime() !== currentWeekStartDate.getTime()) {
        // New week, reset trial time
        trialData = {
          weekStartDate: currentWeekStart,
          timeUsedThisWeek: 0,
          lastUsedDate: now.toISOString(),
          isActive: false
        };
      }
    } else {
      // First time user
      trialData = {
        weekStartDate: currentWeekStart,
        timeUsedThisWeek: 0,
        lastUsedDate: now.toISOString(),
        isActive: false
      };
    }
    
    const remainingSeconds = Math.max(0, TRIAL_LIMIT_SECONDS - trialData.timeUsedThisWeek);
    const isActive = trialData.isActive && remainingSeconds > 0;
    
    console.log('Guest trial initialization:', {
      remainingSeconds,
      timeUsedThisWeek: trialData.timeUsedThisWeek,
      storedIsActive: trialData.isActive,
      calculatedIsActive: isActive
    });
    
    setTimeRemainingSeconds(remainingSeconds);
    setIsTrialExpired(remainingSeconds <= 0);
    setCanStartTrial(remainingSeconds > 0);
    setIsTrialActive(isActive);
    
    // Save updated data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trialData));
    
    return trialData;
  }, []);

  useEffect(() => {
    initializeGuestTrial();
  }, [initializeGuestTrial]);

  // Timer effect when trial is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTrialActive && timeRemainingSeconds > 0) {
      interval = setInterval(() => {
        setTimeRemainingSeconds(prev => {
          const newTime = prev - 1;
          
          // Update localStorage every second
          const storedData = localStorage.getItem(STORAGE_KEY);
          if (storedData) {
            const trialData: GuestTrialData = JSON.parse(storedData);
            trialData.timeUsedThisWeek = TRIAL_LIMIT_SECONDS - newTime;
            trialData.lastUsedDate = new Date().toISOString();
            trialData.isActive = true;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trialData));
          }
          
          if (newTime <= 0) {
            setIsTrialActive(false);
            setIsTrialExpired(true);
            setCanStartTrial(false);
            // Persist inactive state when time runs out
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (storedData) {
              const trialData: GuestTrialData = JSON.parse(storedData);
              trialData.isActive = false;
              localStorage.setItem(STORAGE_KEY, JSON.stringify(trialData));
            }
          }
          
          return Math.max(0, newTime);
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTrialActive, timeRemainingSeconds]);

  const startGuestTrial = () => {
    console.log('Starting guest trial:', { canStartTrial, timeRemainingSeconds });
    if (canStartTrial && timeRemainingSeconds > 0) {
      console.log('Conditions met, starting trial...');
      setIsTrialActive(true);
      // Persist active state
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const trialData: GuestTrialData = JSON.parse(storedData);
        trialData.isActive = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trialData));
        console.log('Guest trial started and persisted:', trialData);
      } else {
        console.log('No stored data found, creating new trial data');
        const newTrialData: GuestTrialData = {
          weekStartDate: getWeekStart(new Date()).toISOString(),
          timeUsedThisWeek: 0,
          lastUsedDate: new Date().toISOString(),
          isActive: true
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTrialData));
        console.log('New trial data created:', newTrialData);
      }
    } else {
      console.log('Cannot start trial - conditions not met:', { canStartTrial, timeRemainingSeconds });
    }
  };

  const stopGuestTrial = () => {
    setIsTrialActive(false);
    // Persist inactive state
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const trialData: GuestTrialData = JSON.parse(storedData);
      trialData.isActive = false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trialData));
    }
  };

  const getTimeRemaining = () => {
    const minutes = Math.floor(timeRemainingSeconds / 60);
    const seconds = timeRemainingSeconds % 60;
    return {
      minutes,
      seconds,
      totalSeconds: timeRemainingSeconds,
      formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`
    };
  };

  const getNextResetDate = () => {
    const now = new Date();
    const nextMonday = getWeekStart(now);
    nextMonday.setDate(nextMonday.getDate() + 7);
    return nextMonday;
  };

  return {
    timeRemainingSeconds,
    isTrialActive,
    isTrialExpired,
    canStartTrial,
    startGuestTrial,
    stopGuestTrial,
    getTimeRemaining,
    getNextResetDate,
    initializeGuestTrial
  };
}