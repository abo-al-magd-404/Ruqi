import AuthForm from "@/components/account/AuthForm/AuthForm";
import GuestGuard from "@/components/auth/GuestGuard";

export default function Login() {
  return (
    <GuestGuard>
      <AuthForm mode="login" />
    </GuestGuard>
  );
}
