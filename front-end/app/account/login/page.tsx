// Login page - renders the shared AuthForm in "login" mode, wrapped in a
// GuestGuard so already-authenticated users are redirected to /account/profile.
import AuthForm from "../module/auth-form";
import GuestGuard from "../module/GuestGuard";

export default function Login() {
  return (
    <GuestGuard>
      <AuthForm mode="login" />
    </GuestGuard>
  );
}

