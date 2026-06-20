import Link from "next/link";
import { FileUp } from "lucide-react";
import { MaterialsList } from "@/components/materials/materials-list";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getMaterialsByUserId } from "@/lib/supabase/queries";

export const metadata = {
  title: "Materials",
};

export default async function MaterialsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const materials = await getMaterialsByUserId(user.id);

  return (
    <>
      <DashboardHeader
        title="Materials"
        description="All uploaded study files and extraction status."
        action={
          <Link href="/dashboard/upload">
            <Button>
              <FileUp className="h-4 w-4" />
              Upload
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        <MaterialsList materials={materials} />
      </div>
    </>
  );
}
