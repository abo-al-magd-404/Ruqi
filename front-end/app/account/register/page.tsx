import AuthForm from "@/components/account/AuthForm/AuthForm";
import GuestGuard from "@/components/auth/GuestGuard";

export default function Register() {
  return (
    <GuestGuard>
      <AuthForm mode="register" />
    </GuestGuard>
  );
}
