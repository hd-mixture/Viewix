import { MainLayout } from "@/components/layout/MainLayout"
import { UploadDropzone } from "@/components/UploadDropzone"
import { PdfViewer } from "@/features/pdf/PdfViewer"
import { OrganizeWorkspace } from "@/features/pdf/OrganizeWorkspace"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"

export function Workspace() {
  const { pdfDocument, isOrganizeMode } = useWorkspaceStore()

  return (
    <MainLayout>
      {!pdfDocument && (
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      )}
      
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {isOrganizeMode ? (
          <OrganizeWorkspace />
        ) : pdfDocument ? (
          <PdfViewer />
        ) : (
          <UploadDropzone />
        )}
      </div>
    </MainLayout>
  )
}
