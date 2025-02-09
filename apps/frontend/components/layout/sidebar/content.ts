import {
  BarChart3,
  CircleHelp,
  Home,
  List,
  Settings,
  Users,
} from "lucide-react";
import { TSidebarContent } from "./types";

export const SIDEBAR_CONTENT: TSidebarContent = {
  links: [
    {
      title: "Dashboard",
      href: "/",
      icon: {
        icon: Home,
        iconTitle: "Dashboard",
      },
    },
    {
      title: "Campaigns",
      href: "/campaigns",
      icon: {
        icon: List,
        iconTitle: "Activity",
      },
    },
    {
      title: "Patients",
      href: "/patients",
      icon: {
        icon: Users,
        iconTitle: "Patients",
      },
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: {
        icon: BarChart3,
        iconTitle: "Analytics",
      },
    },
  ],
  other_links: [
    {
      title: "Settings",
      href: "/settings",
      icon: {
        icon: Settings,
        iconTitle: "Settings",
      },
    },
    {
      title: "Support",
      href: "/#support",
      icon: {
        icon: CircleHelp,
        iconTitle: "Support",
      },
    },
  ],
  user: {
    name: "Nathan Hayman",
    email: "nathan@semg.com",
    avatar: "/avatars/pfp.jpg",
    role: "Admin",
    organization: {
      name: "Southeast Medical Group",
      slug: "semg",
      logo: "/avatars/org-pfp.jpg",
      plan: "Free",
    },
  },
};
