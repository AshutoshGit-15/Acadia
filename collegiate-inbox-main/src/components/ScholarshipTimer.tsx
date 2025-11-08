import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface ScholarshipTimerProps {
  deadline: number;
  name: string;
}

export function ScholarshipTimer({ deadline, name }: ScholarshipTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div className="flex items-center gap-2 text-sm font-mono">
      <Clock className="h-4 w-4" />
      <span className="font-semibold">{timeLeft}</span>
    </div>
  );
}
