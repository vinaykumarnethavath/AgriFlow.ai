import { redirect } from "next/navigation";

export default function SOSRedirectPage() {
    redirect("/dashboard/farmer/emergency");
}
