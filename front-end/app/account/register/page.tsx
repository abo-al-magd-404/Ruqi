// Register page - renders the shared AuthForm in "register" mode, wrapped in a
// GuestGuard so already-authenticated users are redirected to /account/profile.
import AuthForm from "../module/auth-form";
import GuestGuard from "../module/GuestGuard";

export default function Register() {
  return (
    <GuestGuard>
      <AuthForm mode="register" />
    </GuestGuard>
  );
}
