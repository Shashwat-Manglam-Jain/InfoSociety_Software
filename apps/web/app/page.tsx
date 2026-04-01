"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getHomePageCopy } from "@/shared/i18n/marketing-copy";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { CapabilitiesSection } from "@/components/home/capabilities-section";
import { CtaSection } from "@/components/home/cta-section";
import { SocietiesSection } from "@/components/home/societies-section";
import { WorkspacesSection } from "@/components/home/workspaces-section";
import { PricingSection } from "@/components/home/pricing-section";
import { getWorkspaceDefinitions, getWorkspaceUiCopy } from "@/features/roles/workspace-definitions";
import { toast } from "@/shared/ui/toast";
import { getSession, getDefaultDashboardPath } from "@/shared/auth/session";
import { Box } from "@mui/material";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";

export default function HomePage() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const homeCopy = getHomePageCopy(locale);
  const workspaceUi = getWorkspaceUiCopy(locale);
  const workspaces = getWorkspaceDefinitions(locale);

  useEffect(() => {
    const session = getSession();
    if (session) {
      router.replace(getDefaultDashboardPath(session.accountType));
    }
  }, [router]);

  const handleAction = (msg: string) => {
    toast.info(msg);
  };

  const featureIcons = [
    <SecurityRoundedIcon key="sec" sx={{ fontSize: 40, color: "secondary.main" }} />,
    <SpeedRoundedIcon key="speed" sx={{ fontSize: 40, color: "secondary.main" }} />,
    <PeopleAltRoundedIcon key="people" sx={{ fontSize: 40, color: "secondary.main" }} />,
    <AssessmentRoundedIcon key="assess" sx={{ fontSize: 40, color: "secondary.main" }} />
  ];

  const features = homeCopy.features.map((f: any, i: number) => ({
    ...f,
    icon: featureIcons[i] || featureIcons[0]
  }));

  const pricingPlans = [
    { 
      id: "FREE", 
      price: t("register.plan.free"), 
      descriptionKey: "pricing.free.description", 
      features: homeCopy.freePlanFeatures 
    },
    { 
      id: "PREMIUM", 
      highlighted: true, 
      price: t("register.plan.premium"), 
      descriptionKey: "pricing.premium.description", 
      features: homeCopy.premiumPlanFeatures 
    }
  ];

  return (
    <Box>
      <HeroSection homeCopy={homeCopy} handleAction={handleAction} />
      
      {/* Societies Section as the main discovery point */}
      <SocietiesSection />

      <WorkspacesSection workspaceUi={workspaceUi} workspaces={workspaces} locale={locale} />

      <FeaturesSection homeCopy={homeCopy} features={features} />
      
      <CapabilitiesSection homeCopy={homeCopy} />

      <PricingSection t={t} pricingPlans={pricingPlans} handleAction={handleAction} homeCopy={homeCopy} />
      
      <CtaSection homeCopy={homeCopy} handleAction={handleAction} />
    </Box>
  );
}
