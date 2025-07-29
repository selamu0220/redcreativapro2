import { useState, useEffect } from 'react';

interface TrialData {
  lastUsedDate: string;
  timeUsedToday: number; // in seconds
  startDate: string;
}

const TRIAL_LIMIT_DAYS = 7;
const STORAGE_KEY = 'redcreativa_trial_data';

export function useTrialMode() {
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(TRIAL_LIMIT_DAYS);
  const [isTrialActive, setIsTrialActive] = useState<boolean>(false);
  const [isTrialExpired, setIsTrialExpired] = useState<boolean>(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    let trialData: TrialData;
    
    if (storedData) {
      trialData = JSON.parse(storedData);
      
      // Reset if it's a new day
      if (trialData.lastUsedDate !== today) {
        trialData = {
          lastUsedDate: today,
          timeUsedToday: 0,
          startDate: trialData.startDate || today
        };
      }
    } else {
      trialData = {
        lastUsedDate: today,
        timeUsedToday: 0,
        startDate: today
      };
    }
    
    const trialStartDate = new Date(trialData.startDate);
    const currentDate = new Date();
    const daysPassed = Math.floor((currentDate.getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, TRIAL_LIMIT_DAYS - daysPassed);
    setTrialDaysLeft(remainingDays);
    setIsTrialExpired(remainingDays <= 0);
    
    // Save updated data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trialData));
  }, []);

  const startTrial = () => {
    if (trialDaysLeft > 0) {
      setIsTrialActive(true);
    }
  };

  const stopTrial = () => {
    setIsTrialActive(false);
  };

  const initializeTrial = () => {
    const today = new Date().toISOString();
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    let trialData: TrialData;
    if (storedData) {
      trialData = JSON.parse(storedData);
      if (!trialData.startDate) {
        trialData.startDate = today;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trialData));
      }
    } else {
      trialData = {
        lastUsedDate: today,
        timeUsedToday: 0,
        startDate: today
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trialData));
    }
    
    const trialStartDate = new Date(trialData.startDate);
    const currentDate = new Date();
    const daysPassed = Math.floor((currentDate.getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, TRIAL_LIMIT_DAYS - daysPassed);
    setTrialDaysLeft(remainingDays);
    
    if (remainingDays <= 0) {
      setIsTrialExpired(true);
      setIsTrialActive(false);
    }
  };

  const resetTrial = () => {
    const today = new Date().toISOString();
    const trialData: TrialData = {
      lastUsedDate: today,
      timeUsedToday: 0,
      startDate: today
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trialData));
    setTrialDaysLeft(TRIAL_LIMIT_DAYS);
    setIsTrialExpired(false);
    setIsTrialActive(false);
  };

  return {
    trialDaysLeft,
    isTrialActive,
    isTrialExpired,
    startTrial,
    stopTrial,
    initializeTrial,
    resetTrial,
    canUseTrial: trialDaysLeft > 0
  };
}