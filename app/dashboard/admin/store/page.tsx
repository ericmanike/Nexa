import { redirect } from "next/navigation";

export default function AdminStoreRedirectPage() {
  redirect("/dashboard/admin/stores");
}
