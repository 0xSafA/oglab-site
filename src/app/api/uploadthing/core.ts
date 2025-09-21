import { createUploadthing, type FileRouter } from "uploadthing/next";
import { createServerComponentClient } from "@/lib/supabase-server";

const f = createUploadthing({
  /**
   * Log out more information about the error, but don't return it to the client
   * @see https://docs.uploadthing.com/errors#error-formatting
   */
  errorFormatter: (err) => {
    console.log("Upload error:", err.message);
    console.log("  - Above error caused by:", err.cause);
    console.log("  - Above error stack:", err.stack);
    return { message: err.message };
  },
});

export const ourFileRouter = {
  logoUploader: f({ image: { maxFileSize: "256KB", maxFileCount: 1 } })
    .middleware(async () => {
      // Check authentication
      const supabase = await createServerComponentClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("Unauthorized");
      }

      // Check user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        throw new Error("Forbidden");
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      
      // Validate SVG file
      if (!file.name.toLowerCase().endsWith('.svg')) {
        throw new Error("Only SVG files are allowed");
      }

      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
