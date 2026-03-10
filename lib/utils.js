import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const STOPPAGE_TYPES = [
  "Failure to Feed",
  "Failure to Eject",
  "Failure to Fire",
  "Failure to Extract",
  "Double Feed",
  "Stovepipe",
  "Light Strike",
  "Other"
];

export const CALIBERS = [
  "9mm",
  "5.56 NATO",
  "7.62 NATO",
  ".300 BLK",
  ".45 ACP",
  "12 Gauge"
];

export const AMMO_TYPES = {
  "9mm": ["FMJ 115gr", "FMJ 124gr", "JHP 124gr", "JHP 147gr"],
  "5.56 NATO": ["M193 55gr", "M855 62gr", "Mk262 77gr"],
  "7.62 NATO": ["M80 147gr", "M118LR 175gr"],
  ".300 BLK": ["Supersonic 110gr", "Subsonic 220gr"],
  ".45 ACP": ["FMJ 230gr"],
  "12 Gauge": ["00 Buck", "Slug", "Birdshot"]
};

export const OPERATORS = [
  "Operator 1",
  "Operator 2",
  "Operator 3",
  "Operator 4",
  "Operator 5",
];

export const MEASUREMENT_FIELDS = [
  { key: 'headspace', label: 'Headspace', unit: '"', placeholder: 'e.g. 1.635' },
  { key: 'firing_pin_indent', label: 'Firing Pin Indent', shortLabel: 'Pin Indent', unit: '"', placeholder: 'e.g. 0.065' },
  { key: 'trigger_weight', label: 'Trigger Weight', shortLabel: 'Trigger Wt', unit: ' lbs', placeholder: 'e.g. 5.2' },
];