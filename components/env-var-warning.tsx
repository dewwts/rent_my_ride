import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export function EnvVarWarning() {
  return (
    <div className="flex gap-4 items-center">
      <Badge variant={"outline"} className="font-normal">
        Supabase environment variables required
      </Badge>
      <div className="flex gap-2">
        <Link href="auth/login">
          <Button size="sm" variant={"outline"} >
            Sign in
          </Button>
        </Link>
        <Link href="auth/sign-up">
          <Button size="sm" variant={"default"} >
            Sign up
          </Button>
        </Link>
      </div>
    </div>
  );
}
