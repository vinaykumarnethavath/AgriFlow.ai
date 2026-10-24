"use client";

import React from "react";

export interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: string;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  if (!isOpen) return null;
  return null;
}
