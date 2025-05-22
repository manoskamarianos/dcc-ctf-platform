import { permanentRedirect } from "next/navigation";

export default async function Index() {
  return (
    <main>
      {/* This content won't be shown as we're redirecting,
          but it's good practice to have a proper layout structure */}
      <div className="container mx-auto p-4 text-center">
        <p>Redirecting to home page...</p>
        {permanentRedirect("/home")}
      </div>
    </main>
  );
}
