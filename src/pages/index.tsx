import {
  BookmarkIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { type GetServerSideProps, type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

const features = [
  {
    name: "Save restaurants",
    description:
      "Find any restaurant on Yelp and keep a list of the ones you love, the ones to skip, and the ones you want to try.",
    icon: BookmarkIcon,
  },
  {
    name: "Log dishes",
    description:
      "Remember what you ordered, whether it was worth it, and a note for next time.",
    icon: ClipboardDocumentListIcon,
  },
  {
    name: "Share lists",
    description:
      "Invite friends and family to see your list, or to add to it too.",
    icon: UsersIcon,
  },
];

// signed-in users go straight to the dashboard, before the landing page renders
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  if (session?.user) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }
  return { props: {} };
};

const Home: NextPage = () => {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>yummy</title>
        <meta
          name="description"
          content="A personal restaurant and dish journal powered by Yelp. Save restaurants you like, dislike or want to try, rate dishes and share your list with collaborators."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
        <div className="flex max-w-5xl flex-col items-center gap-10 px-4 py-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-800 sm:text-[5rem]">
              yum<span className="text-indigo-500">shin</span>
            </h1>
            <p className="max-w-xl text-lg text-gray-600 sm:text-xl">
              Your personal journal of restaurants and the dishes worth ordering
              again.
            </p>
          </div>
          <button
            className="rounded-full bg-indigo-600 px-10 py-3 font-semibold text-white shadow transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            onClick={
              session
                ? () => router.push("/dashboard")
                : () =>
                    signIn("auth0", {
                      callbackUrl: "/dashboard",
                    })
            }
          >
            {session ? "Go to dashboard" : "Sign in"}
          </button>
          <ul className="grid w-full gap-4 sm:grid-cols-3">
            {features.map((feature) => (
              <li
                key={feature.name}
                className="rounded-xl bg-white p-5 drop-shadow-md"
              >
                <feature.icon className="h-7 w-7 text-indigo-500" aria-hidden />
                <h2 className="mt-3 font-medium text-gray-900">
                  {feature.name}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {feature.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
};

export default Home;
