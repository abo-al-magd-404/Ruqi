import AuthForm from "../module/auth-form";
import GuestGuard from "../module/GuestGuard";

export default function Register() {
  return (
    <GuestGuard>
      <AuthForm mode="register" />
    </GuestGuard>
  );
}
