import { useState } from "react";
import { UserIcon } from "lucide-react";

import PageState from "@/components/PageState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useFetch } from "@/hooks/useFetch";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";

const MAX_SIZE = 5 * 1024 * 1024; // matches middleware/upload.js

export default function Profile() {
  const { updateUser } = useAuth();
  const { data: profile, setData, loading, error, reload } = useFetch(api.getProfile);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [inputKey, setInputKey] = useState(0);

  const onUpload = async (e) => {
    e.preventDefault();
    setUploadError("");
    if (!file) return setUploadError("Choose an image first");
    if (!file.type.startsWith("image/")) return setUploadError("Only image files are allowed");
    if (file.size > MAX_SIZE) return setUploadError("File too large. Maximum size is 5MB");

    setUploading(true);
    try {
      const { profilePicture } = await api.uploadProfilePicture(file);
      setData((p) => ({ ...p, profilePicture }));
      updateUser({ profilePicture });
      setFile(null);
      setInputKey((k) => k + 1); // reset the file input
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>

      {loading || error ? (
        <PageState loading={loading} error={error} onRetry={reload} />
      ) : (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>{profile.name}</CardTitle>
            <CardDescription>{profile.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt="" className="size-16 rounded-full border object-cover" />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-full border bg-muted">
                  <UserIcon className="size-6 text-muted-foreground" />
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                <p>Role: {profile.role}</p>
                <p>Joined {formatDate(profile.createdAt)}</p>
              </div>
            </div>

            <form onSubmit={onUpload} className="space-y-2">
              <Label htmlFor="picture">Profile picture</Label>
              <div className="flex gap-2">
                <Input
                  key={inputKey}
                  id="picture"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <Button type="submit" disabled={uploading || !file}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Images only, max 5MB.</p>
              {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
