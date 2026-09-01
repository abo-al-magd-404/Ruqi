import PlateFormBeforeLogin from "@/components/account/landingLogin&Register";
import GuestGuard from "@/components/account/auth/GuestGuard";

export default function AccountPage() {
  return (
    <GuestGuard>
      <PlateFormBeforeLogin />
    </GuestGuard>
  );
}
