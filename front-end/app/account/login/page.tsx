import AuthForm from "../module/auth-form";
import GuestGuard from "../module/GuestGuard";

export default function Login() {
  return (
    <GuestGuard>
      <AuthForm mode="login" />
    </GuestGuard>
  );
}
