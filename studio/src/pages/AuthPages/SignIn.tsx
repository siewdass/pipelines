import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | Pipelines Infrastructure"
        description="Sign in to Pipelines - AI-powered infrastructure management."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
