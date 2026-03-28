"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  CircularProgress,
  Divider,
  Stack,
  Alert,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { upgradeToPremium } from "@/shared/api/client";
import { setSession } from "@/shared/auth/session";
import { toast } from "@/shared/ui/toast";

function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [method, setMethod] = useState<string>("UPI");

  useEffect(() => {
    const token = searchParams.get("token");
    const pMethod = searchParams.get("method") || "UPI";
    if (!token) {
      toast.error("Invalid checkout session.");
      router.push("/login");
      return;
    }
    setSessionToken(token);
    setMethod(pMethod);
  }, [searchParams, router]);

  const initiateSession = (token: string, isPremium: boolean) => {
    try {
      const payloadBase64 = token.split('.')[1];
      const decoded: any = JSON.parse(atob(payloadBase64));
      setSession({
        accessToken: token,
        role: decoded.role || "SUPER_USER",
        accountType: "SOCIETY",
        username: decoded.username || "Society",
        fullName: decoded.sub || "Society Admin",
        societyCode: decoded.societyCode || null,
        subscriptionPlan: isPremium ? "PREMIUM" : "FREE",
        avatarDataUrl: null,
      });
      router.push("/dashboard");
    } catch (err) {
      toast.error("Failed to parse session token.");
      router.push("/login");
    }
  };

  const handlePayment = async () => {
    if (!sessionToken) return;
    setLoading(true);
    try {
      // Simulate real-world payment gateway delay
      await new Promise((res) => setTimeout(res, 1500));
      const upgrade = await upgradeToPremium(sessionToken, {
        paymentMethod: method as any,
        note: "Activated explicitly via checkout page",
      });
      toast.success(upgrade.message || "Payment Successful! Premium Activated.");
      initiateSession(sessionToken, true);
    } catch (err) {
      toast.error("Payment failed. Please try again or continue with Free.");
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (!sessionToken) return;
    toast.info("Continuing with the Free Plan.");
    initiateSession(sessionToken, false);
  };

  if (!sessionToken) {
    return (
      <Container sx={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card elevation={4} sx={{ borderRadius: "16px", overflow: "hidden" }}>
        <Box sx={{ bgcolor: "primary.main", color: "#fff", p: 4, textAlign: "center" }}>
          <CreditCardIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h4" fontWeight={800}>
            Activate Premium
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Secure checkout for your Society Banking Core
          </Typography>
        </Box>
        <CardContent sx={{ p: 4 }}>
          <Alert severity="info" icon={<WarningAmberIcon />} sx={{ mb: 4 }}>
            You are about to subscribe to the Premium Tier. You can pay securely now, or skip this step to remain on the Free Tier forever.
          </Alert>

          <Stack spacing={2} sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle1" fontWeight={700}>Selected Plan</Typography>
              <Typography variant="subtitle1" color="success.main" fontWeight={700}>Premium (Ad-Free)</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle1" fontWeight={700}>Payment Method</Typography>
              <Typography variant="subtitle1" fontWeight={700}>{method.replace("_", " ")}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" fontWeight={800}>Total Due</Typography>
              <Typography variant="h6" fontWeight={800}>₹12,499.00</Typography>
            </Box>
          </Stack>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={handlePayment}
              disabled={loading}
              sx={{ py: 1.5, fontSize: "1.1rem", fontWeight: 700 }}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutlineIcon />}
            >
              {loading ? "Processing Securely..." : `Pay ₹12,499 securely`}
            </Button>
            <Button
              variant="text"
              color="inherit"
              onClick={handleSkip}
              disabled={loading}
              sx={{ color: "text.secondary" }}
            >
              Skip and continue with Free Plan
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutInner />
    </Suspense>
  );
}
