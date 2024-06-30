import IndeedForm from "~/components/indeed-form/indeed-form";
import {
  TypographyH1,
  TypographyH3,
  TypographyP,
} from "~/components/typography/typography";

export default function Indeed() {
  return (
    <main className="my-10 flex min-h-screen flex-col items-center bg-background dark:bg-background">
      <IndeedForm />
    </main>
  );
}
