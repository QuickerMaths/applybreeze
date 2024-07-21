import Link from "next/link";
import {
    TypographyH1,
    TypographyH3,
    TypographyP,
} from "~/components/typography/typography";

export default function Jobs() {
    return (
        <main className="flex flex-col items-center justify-center bg-background dark:bg-background">
            <TypographyH1 className="text-center text-4xl font-bold text-primary dark:text-primary">
                Serach for new opportunities
            </TypographyH1>
            <TypographyP className="text-center text-lg text-gray-500 dark:text-gray-400">
                Find the job that you love
            </TypographyP>
            <div className="grid-row-1 mt-5 grid grid-cols-2 gap-5">
                <Link href="/find-jobs/linkedin">
                    <div className="flex flex-col items-center justify-center border-[1px] border-black bg-secondary p-5 dark:border-white">
                        <TypographyH3
                            tag="h2"
                            className="text-2xl font-bold text-primary text-white dark:text-primary"
                        >
                            LinkedIn
                        </TypographyH3>
                    </div>
                </Link>
                <Link href="/find-jobs/indeed">
                    <div className="flex flex-col items-center justify-center border-[1px] border-black bg-secondary p-5 dark:border-white">
                        <TypographyH3
                            tag="h2"
                            className="text-2xl font-bold text-primary text-white dark:text-primary"
                        >
                            Indeed
                        </TypographyH3>
                    </div>
                </Link>
            </div>
        </main>
    );
}
