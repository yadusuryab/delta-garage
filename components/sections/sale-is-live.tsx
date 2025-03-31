"use client";
import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";

// Function to get the next midnight UTC time
function getNextMidnightUTC() {
  const now = new Date();
  const nextMidnight = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0
    )
  );
  return nextMidnight;
}

// Function to calculate the time left
function getTimeLeft(endTime: Date) {
  const now = new Date();
  const difference = endTime.getTime() - now.getTime();

  if (difference <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, isExpired: false };
}

function ProductCardWithSale() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });
  const [saleEndTime, setSaleEndTime] = useState<Date | null>(null);

  useEffect(() => {
    const endTime = getNextMidnightUTC();
    setSaleEndTime(endTime);
    setTimeLeft(getTimeLeft(endTime));

    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (timeLeft.isExpired) return null;

  return (
    <div>
      <div className="flex w-full gap-2 my-2 md:items-center md:mt-24 md:max-w-[700px] mx-auto">
        <div className="flex grow gap-3 md:items-center">
          <div
            style={{
              backgroundColor: "rgba(15, 15, 15, 1)",
              backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `,
              backgroundSize: "20px 20px",
            }}
            className="flex grow flex-col bg-gradient from-bw to-main p-4 rounded-3xl justify-between my-2 shadow gap-3 md:flex-row md:items-center"
          >
            <div className="space-b-0.5 flex w-full items-center  gap-4">
              <p className="text-2xl font-bold tracking-tighter">Sale Is Live!</p>
              <Badge className="text-md ">24Hr Deal</Badge>
            </div>
            <div className="flex gap-3 max-md:flex-wrap w-full">
              <div className="flex items-center divide-x w-full divide-border rounded-xl bg-secondary border text-2xl font-bold tabular-nums">
                <span className="flex h-10 w-full items-center justify-center p-2">
                  {timeLeft.hours.toString().padStart(2, "0")}
                  <span className="text-muted-foreground">h</span>
                </span>
                <span className="flex h-10 w-full items-center justify-center p-2">
                  {timeLeft.minutes.toString().padStart(2, "0")}
                  <span className="text-muted-foreground">m</span>
                </span>
                <span className="flex h-10 w-full  items-center justify-center p-2">
                  {timeLeft.seconds.toString().padStart(2, "0")}
                  <span className="text-muted-foreground">s</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ProductCardWithSale };
