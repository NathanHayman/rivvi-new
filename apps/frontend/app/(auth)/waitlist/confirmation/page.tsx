import { ConfettiComponent } from "@/components/waitlist-confirmation";
import { Button } from "@workspace/ui/components/button";
import { Logo } from "@workspace/ui/components/shared/logos/rivvi-logo";
import { CheckIcon, MailIcon, Sparkle } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Waitlist Confirmed - Rivvi",
  description:
    "You have been added to our waitlist! We'll be in touch soon with updates on your waitlist status!",
};

export default function ConfirmationPage() {
  return (
    <ConfettiComponent type="side-cannons">
      <div className="grid lg:min-h-svh lg:grid-cols-2 w-full">
        <div className="gap-4 py-6 md:p-10 md:pb-48 w-full lg:h-auto col-span-2">
          <div className="flex justify-center gap-2">
            <a href="#" className="flex items-center gap-2 font-medium">
              <Logo
                typeClassName="text-2xl h-fit leading-none text-white"
                markClassName="h-7 pb-1.5 translate-y-0 w-fit"
                markTheme="light"
                variant="full"
              />
            </a>
          </div>
          <div className="p-10 lg:p-20 w-full flex justify-center items-center">
            <div className="relative flex lg:h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background dark:bg-foreground/90 backdrop-blur-sm md:shadow-xl lg:w-[800px] p-6 lg:p-10 py-12 space-y-12">
              <div className="text-balance flex flex-col items-center justify-center h-full">
                <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-full bg-green-500/20 text-green-500 border border-green-500/20 mb-4">
                  <CheckIcon className="size-6 lg:size-8 text-green-500" />
                </div>
                <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-800/80 bg-clip-text text-center text-2xl lg:text-5xl font-bold tracking-tighter text-transparent max-w-md">
                  You have been added to our waitlist!
                </span>
                <p className="text-sm lg:text-base text-gray-500 mt-3 lg:mt-6 text-wrap max-w-md text-center">
                  Thank you for your interest in Rivvi. We&apos;ll be in touch
                  soon with updates on your waitlist status!
                </p>
                <div className="flex gap-4 mt-10">
                  <Link href="https://rivvi.ai/#contact">
                    <Button
                      variant="link"
                      className="w-full dark:invert"
                      effect={"hoverUnderline"}
                      size={"sm"}
                    >
                      <MailIcon className="size-4" />
                      Contact us
                    </Button>
                  </Link>

                  <Button
                    effect={"expandIcon"}
                    icon={Sparkle}
                    iconPlacement="left"
                    className="w-full dark:invert"
                    size={"sm"}
                  >
                    <Link
                      href="https://rivvi.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className=""
                    >
                      Explore Rivvi
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConfettiComponent>
  );
}
