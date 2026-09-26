import {
  CARREFOUR_BRANCHES,
  NAIVAS_BRANCHES,
  QUICKMART_BRANCHES,
  countBranches,
  flattenBranchNames,
  type BranchCounty,
} from "./branch-data";

export type Employer = "carrefour" | "quickmart" | "naivas";

export interface BrandConfig {
  id: Employer;
  name: string;
  tagline: string;
  primary: string;
  accent: string;
  logoText: string;
  logoMark: string;
  logoImage: string; // path in /public
  branchCounties: BranchCounty[];
  branches: string[];
}

export const TOTAL_BRANCH_COUNT =
  countBranches(QUICKMART_BRANCHES) + countBranches(NAIVAS_BRANCHES) + countBranches(CARREFOUR_BRANCHES);

/**
 * Brand colors extracted from official supermarket branding.
 * - Carrefour: deep navy blue + signature red
 * - Quickmart: bright red + black
 * - Naivas: signature orange + accent yellow
 */
export const BRANDS: Record<Employer, BrandConfig> = {
  carrefour: {
    id: "carrefour",
    name: "Carrefour",
    tagline: "Choisi pour vous",
    primary: "#003D7E",
    accent: "#E2231A",
    logoText: "Carrefour",
    logoMark: "C",
    logoImage: "/brand-logos/carrefour.png",
    branchCounties: CARREFOUR_BRANCHES,
    branches: flattenBranchNames(CARREFOUR_BRANCHES),
  },
  quickmart: {
    id: "quickmart",
    name: "Quickmart",
    tagline: "Quick. Easy. Affordable.",
    primary: "#E30613",
    accent: "#1A1A1A",
    logoText: "Quickmart",
    logoMark: "Q",
    logoImage: "/brand-logos/quickmart.jpeg",
    branchCounties: QUICKMART_BRANCHES,
    branches: flattenBranchNames(QUICKMART_BRANCHES),
  },
  naivas: {
    id: "naivas",
    name: "Naivas",
    tagline: "Sawa na Wewe",
    primary: "#F36F21",
    accent: "#FFC20E",
    logoText: "Naivas",
    logoMark: "N",
    logoImage: "/brand-logos/naivas.png",
    branchCounties: NAIVAS_BRANCHES,
    branches: flattenBranchNames(NAIVAS_BRANCHES),
  },
};

export const POSITIONS = [
  "Cashier",
  "Driver",
  "Cleaner",
  "Store Keeper",
  "Loader & Off-loader",
  "Marketer",
  "Sales Attendant",
  "Chef",
  "Warehouse Supervisor",
  "Guard",
];
