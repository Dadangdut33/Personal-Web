import { Link } from '@/components/Router';
import DotPattern from '@/components/ui/DotPattern';
import { Image, Text } from '@mantine/core';

export default function Home() {
  return (
    <main className="inset-0 flex w-full flex-col items-center justify-center pt-[50px] px-4 m500:pt-[10px]">
      <div className="mx-auto w-container max-w-full px-5 text-center">
        <DotPattern classname="mb-6">
          <Image src={'/assets/logo-transparent.png'} alt="Logo" className="w-[300px]" />
        </DotPattern>

        <h1 className="text-2xl font-heading sm:text-4xl ">Hello :D</h1>
      </div>

      <div className="text-base sm:text-lg max-w-prose mt-6">
        <p className="text-justify">
          Welcome to my Home Page! I&apos;m Fauzan, otherwise known by the nickname Dadangdut33 on the internet.
          I&apos;m a fresh graduate Computer Science student based in Indonesia.
        </p>

        <br />

        <Text className="text-justify">
          I&apos;m currently searching for a job as a software developer. I&apos;m open to any opportunities, so feel
          free to reach out to me. Creating desktop software and web applications is also a particular passion of mine.
          You can check out some of my projects on my{' '}
          <a target="_blank" className="font-heading underline" href="https://github.com/dadangdut33">
            Github
          </a>
          .
        </Text>
        <br />
        <Text className="text-justify">
          While you&apos;re here, feel free to check out my{' '}
          <Link className="font-heading underline" href="/project">
            projects showcase
          </Link>{' '}
          and{' '}
          <Link className="font-heading underline" href="/blog">
            blog posts
          </Link>
          .
        </Text>
        <Text className="text-justify">I hope you enjoy your visit here :) Thanks for stopping by!</Text>
      </div>
    </main>
  );
}
