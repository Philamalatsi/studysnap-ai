import { DashboardHeader } from "@/components/layout/dashboard-header";
import { UploadDropzone } from "@/features/uploads/upload-dropzone";

export const metadata = {
  title: "Upload",
};

export default function UploadPage() {
  return (
    <>
      <DashboardHeader
        title="Upload materials"
        description="Add textbook photos, notes, screenshots, or PDFs. Files are stored securely in your uploads bucket."
      />
      <div className="p-6">
        <UploadDropzone />
      </div>
    </>
  );
}
