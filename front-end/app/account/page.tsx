import PlateFormBeforeLogin from "@/components/account/landingLogin&Register";
import GuestGuard from "@/components/auth/GuestGuard";

export default function AccountPage() {
  return (
    <GuestGuard>
      <PlateFormBeforeLogin />
    </GuestGuard>
  );
}
