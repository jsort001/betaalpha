import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/sign-out-button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Not authorized</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            This Google account isn&apos;t on the chapter allowlist. Contact
            an officer to be added, then try signing in again.
          </p>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
