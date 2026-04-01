import React, { useState, useEffect } from "react";
import { formatTimeRemaining } from "../utils/helpers.js";

const CountdownTimer = ({ secondsRemaining, isTriggered }) => {
  const [displayTime, setDisplayTime] = useState(secondsRemaining);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      setDisplayTime(0);
      return;
    }

    const interval = setInterval(() => {
      setDisplayTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining]);

  if (isTriggered) {
    return (
      <div className="p-4 bg-red-900 border-2 border-red-600 rounded-lg text-center">
        <p className="text-red-200 text-sm font-semibold">⚠️ INACTIVITY TRIGGERED</p>
        <p className="text-red-100 text-lg font-bold">Will Can Be Executed</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 border-2 border-indigo-500 rounded-lg text-center">
      <p className="text-blue-200 text-sm font-semibold">Time Until Trigger</p>
      <p className="text-white text-2xl font-bold mt-2">{formatTimeRemaining(displayTime)}</p>
    </div>
  );
};

export default CountdownTimer;
