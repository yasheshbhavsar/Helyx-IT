export type Project = {
  id: string;
  number: string;
  name: string;
  category: string;
  description: string;
  capabilities: string[];
  url: string;
  domain: string;
  image: string;
  imageAlt: string;
};

export const projects: Project[] = [
  {
    id: "qr-generator",
    number: "01",
    name: "Free QR Code Generator",
    category: "DIGITAL PRODUCT / UTILITY",
    description:
      "A streamlined QR creation platform built around accessibility, utility and a frictionless user experience.",
    capabilities: ["Product experience", "Interactive workflows", "Utility-first design"],
    url: "https://www.freeqrcodegenerator.pro/",
    domain: "freeqrcodegenerator.pro",
    image: "/projects/free-qr-site.webp",
    imageAlt: "Screenshot of the Free QR Code Generator live website homepage",
  },
  {
    id: "la-minas-pizza",
    number: "02",
    name: "La Mina's Pizza",
    category: "FOOD & HOSPITALITY",
    description:
      "A food-focused digital experience bringing brand presentation, appetite appeal and customer usability together.",
    capabilities: ["Brand presentation", "Menu discovery", "Mobile usability"],
    url: "https://www.laminaspizza.com/",
    domain: "laminaspizza.com",
    image: "/projects/la-minas-site.webp",
    imageAlt: "Screenshot of the La Mina's Pizza live website with its food-led design",
  },
  {
    id: "jaydarsh-technocrats",
    number: "03",
    name: "Jaydarsh Technocrats",
    category: "CORPORATE / DIGITAL PRODUCTS",
    description:
      "A professional digital presence that communicates software capabilities and brings a live mobile product into view.",
    capabilities: ["Corporate identity", "Service discovery", "Product presentation"],
    url: "https://jaydarshtechnocrats.in/",
    domain: "jaydarshtechnocrats.in",
    image: "/projects/jaydarsh-site.webp",
    imageAlt: "Screenshot of the Jaydarsh Technocrats live corporate website homepage",
  },
];
