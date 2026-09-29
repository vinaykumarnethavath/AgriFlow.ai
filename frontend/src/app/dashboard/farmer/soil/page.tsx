import { redirect } from "next/navigation";

export default function FarmerSoilPage() {
    redirect("/dashboard/farmer/nutrition?tab=soil");
}
