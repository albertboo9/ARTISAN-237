"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Inbox, MapPin, AlertCircle, Briefcase } from "lucide-react";
import Button from "./button";

interface EmptyStateProps {
  icon?: "search" | "inbox" | "location" | "alert" | "briefcase";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const ICONS = {
  search: Search,
  inbox: Inbox,
  location: MapPin,
  alert: AlertCircle,
  briefcase: Briefcase,
};

export function EmptyState({
  icon = "inbox",
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  const Icon = ICONS[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-5">
        <Icon size={28} className="text-on-surface-variant" />
      </div>
      <h3 className="text-lg font-bold text-on-surface mb-2">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-brand-primary text-surface hover:bg-brand-hover rounded-full h-10 px-6 font-semibold"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}