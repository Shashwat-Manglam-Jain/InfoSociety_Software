"use client";

import { FormEvent, useMemo, useState } from "react";
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
import { login } from "@/shared/api/client";
import { setSession } from "@/shared/auth/session";
import type { UserRole } from "@/shared/types";

const roleTabs: { label: string; value: UserRole }[] = [
  { label: "Client", value: "CLIENT" },
  { label: "Agent", value: "AGENT" },
  { label: "Superuser", value: "SUPER_USER" }
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("CLIENT");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hint = useMemo(() => {
    if (role === "SUPER_USER") return "Demo: superuser / Super@123";
    if (role === "AGENT") return "Demo: agent1 / Agent@123";
    return "Demo: client1 / Client@123";
  }, [role]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login(username, password);

      if (response.user.role !== role) {
        setError(`This account is ${response.user.role}. Choose the matching login tab.`);
        setLoading(false);
        return;
      }

      setSession({
        accessToken: response.accessToken,
        role: response.user.role,
        username: response.user.username,
        fullName: response.user.fullName,
        societyCode: response.user.society?.code ?? null
      });

      router.push("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Chip label="Secure Login" color="primary" variant="outlined" sx={{ mb: 1.4 }} />
          <Typography variant="h4" sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }}>
            Info Banking Access
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.8, mb: 2 }}>
            Choose your role and sign in.
          </Typography>

          <Tabs value={role} onChange={(_, value: UserRole) => setRole(value)} variant="fullWidth" sx={{ mb: 2 }}>
            {roleTabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>

          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={1.5}>
              <TextField
                label="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                fullWidth
              />

              <Typography variant="body2" color="text.secondary">
                {hint}
              </Typography>

              {error ? <Alert severity="error">{error}</Alert> : null}

              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
