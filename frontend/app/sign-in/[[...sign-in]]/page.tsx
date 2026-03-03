import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="bg-background flex min-h-svh items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            cardBox: 'shadow-md rounded-2xl',
          },
        }}
      />
    </div>
  );
}
