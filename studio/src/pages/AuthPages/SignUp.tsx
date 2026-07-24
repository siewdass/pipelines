import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up | Pipelines Infrastructure"
        description="Create an account for Pipelines - AI-powered infrastructure management."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
