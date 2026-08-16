"use client";

import { useState, useEffect } from "react";
import { useDebounceValue } from "usehooks-ts";
import { authApi } from "@/lib/api";
import { Check, X, Loader2 } from "lucide-react";

interface UsernameAvailabilityIndicatorProps {
  username: string;
}

type AvailabilityStatus = "idle" | "checking" | "available" | "taken" | "error";

export default function UsernameAvailabilityIndicator({
  username,
}: UsernameAvailabilityIndicatorProps) {
  const [status, setStatus] = useState<AvailabilityStatus>("idle");
  const [debouncedUsername] = useDebounceValue(username, 300);

  useEffect(() => {
    if (!debouncedUsername || debouncedUsername.length < 3) {
      setStatus("idle");
      return;
    }

    const checkAvailability = async () => {
      try {
        setStatus("checking");
        const response =
          await authApi.checkUsernameAvailability(debouncedUsername);
        setStatus(response.available ? "available" : "taken");
      } catch (error) {
        setStatus("error");
      }
    };

    checkAvailability();
  }, [debouncedUsername]);

  if (status === "idle") return null;

  const statusConfig = {
    checking: {
      icon: <Loader2 className="w-5 h-5 animate-spin text-gray-500" />,
      text: "Checking...",
      color: "text-gray-500",
    },
    available: {
      icon: <Check className="w-5 h-5" />,
      text: "Available",
      color: "text-green-500",
    },
    taken: {
      icon: <X className="w-5 h-5" />,
      text: "Taken",
      color: "text-red-500",
    },
    error: {
      icon: <X className="w-5 h-5" />,
      text: "Error",
      color: "text-red-500",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-1 ${config.color}`}>
      {config.icon}
      <span className="text-sm whitespace-nowrap">{config.text}</span>
    </div>
  );
}
