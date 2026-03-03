import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="bg-background flex min-h-svh items-center justify-center">
      <SignUp
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
