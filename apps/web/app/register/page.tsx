"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { getBillingPlans, registerClient, upgradeToPremium } from "@/shared/api/client";
import { setSession } from "@/shared/auth/session";
import type { BillingPlansResponse, SubscriptionPlan } from "@/shared/types";

const fallbackPlans: BillingPlansResponse = {
  currency: "INR",
  plans: [
    {
      id: "FREE",
      name: "Common",
      monthlyPrice: 0,
      adsEnabled: true,
      description: "Free account with ad-supported dashboard."
    },
    {
      id: "PREMIUM",
      name: "Premium",
      monthlyPrice: 299,
      adsEnabled: false,
      description: "Ad-free dashboard with monthly billing."
    }
  ]
};

export default function RegisterPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<SubscriptionPlan>("FREE");
  const [plans, setPlans] = useState<BillingPlansResponse>(fallbackPlans);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [societyCode, setSocietyCode] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const result = await getBillingPlans();
        setPlans(result);
      } catch {
        setPlans(fallbackPlans);
      }
    }

    void loadPlans();
  }, []);

  const selectedPlan = useMemo(() => {
    return plans.plans.find((item) => item.id === plan);
  }, [plan, plans.plans]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await registerClient({
        username: username.trim(),
        password,
        fullName: fullName.trim(),
        societyCode: societyCode.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined
      });

      let subscription = response.user.subscription;

      if (plan === "PREMIUM" && response.user.role === "CLIENT") {
        const upgraded = await upgradeToPremium(response.accessToken);
        subscription = upgraded.subscription;
      }

      setSession({
        accessToken: response.accessToken,
        role: response.user.role,
        username: response.user.username,
        fullName: response.user.fullName,
        societyCode: response.user.society?.code ?? null,
        subscriptionPlan: subscription?.plan ?? response.user.subscription?.plan ?? null
      });

      router.push("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create account");
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Card className="surface-glass fade-rise" sx={{ overflow: "hidden" }}>
        <Grid container>
          <Grid size={{ xs: 12, md: 5 }} sx={{ p: { xs: 2.2, md: 3.4 }, bgcolor: "#104f79", color: "#fff" }}>
            <Chip label="Create Account" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", mb: 1.2 }} />
            <Typography variant="h5" sx={{ color: "#fff" }}>
              Free for Everyone, Premium When You Need It
            </Typography>
            <Typography sx={{ mt: 0.8, color: "#d1eaff", mb: 2 }}>
              Common account shows ads. Premium account removes ads and is billed monthly.
            </Typography>
            <Image
              src="/illustrations/insights-panel.svg"
              alt="Illustration of plan and insights panel"
              width={760}
              height={500}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Typography variant="h4" sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }}>
                Start with Free, Upgrade Anytime
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.8, mb: 2 }}>
                Common plan is free with ads. Premium is billed monthly and removes ads from dashboard.
              </Typography>

              <Tabs value={plan} onChange={(_, value: SubscriptionPlan) => setPlan(value)} variant="fullWidth" sx={{ mb: 2 }}>
                {plans.plans.map((item) => (
                  <Tab
                    key={item.id}
                    value={item.id}
                    label={`${item.name} (${item.monthlyPrice === 0 ? "Free" : `₹${item.monthlyPrice}/mo`})`}
                  />
                ))}
              </Tabs>

              {selectedPlan ? (
                <Alert severity={selectedPlan.adsEnabled ? "info" : "success"} sx={{ mb: 2 }}>
                  {selectedPlan.description}
                </Alert>
              ) : null}

              <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={1.5}>
                  <TextField label="Full Name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
                  <TextField label="Username" value={username} onChange={(event) => setUsername(event.target.value)} required />
                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    helperText="Minimum 8 characters"
                  />
                  <TextField
                    label="Society Code"
                    value={societyCode}
                    onChange={(event) => setSocietyCode(event.target.value)}
                    required
                    helperText="Example: SOC-HO"
                  />
                  <TextField label="Phone (Optional)" value={phone} onChange={(event) => setPhone(event.target.value)} />
                  <TextField
                    label="Address (Optional)"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    multiline
                    minRows={2}
                  />

                  {error ? <Alert severity="error">{error}</Alert> : null}

                  <Button type="submit" variant="contained" size="large" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>

                  <Button component={Link} href="/login" variant="text">
                    Already have an account? Sign in
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
}
