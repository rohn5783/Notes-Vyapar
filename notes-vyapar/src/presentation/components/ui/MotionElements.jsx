"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const MotionNextLink = motion.create(Link);

export function MotionLink({ href, className, children, ...props }) {
  return (
    <MotionNextLink
      href={href}
      className={className}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </MotionNextLink>
  );
}

export function MotionButton({ className, children, ...props }) {
  return (
    <motion.button
      className={className}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
