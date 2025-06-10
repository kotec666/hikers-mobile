import Logo from "@/components/ui/logo";
import Spinner from "@/components/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";

function Load(props: { loading: boolean }) {
  return (
    <>
      <AnimatePresence mode="wait">
        {props.loading && (
          <motion.div
            className={`fixed z-40 flex flex-col justify-between items-center gap-11 px-4 py-40 w-full bg-white min-h-full max-h-full`}
            initial="visible"
            variants={{
              hidden: {
                opacity: 0,
                transition: {
                  duration: 0.5,
                  ease: "easeInOut",
                },
              },
              visible: {
                opacity: 1,
                transition: {
                  duration: 0.1,
                  ease: "easeInOut",
                },
              },
            }}
            animate={props.loading ? "visible" : "hidden"}
            exit="hidden"
          >
            <div className="h-[20.4rem] w-full flex flex-col gap-[1.4rem] items-center justify-center">
              <Logo className="w-[5.125rem] h-[4.0625rem]" />
              <p className="poppins font-semibold text-main-green">
                <span className="text-[26.5px] leading-[32px]">hikers</span>
              </p>
            </div>
            <Spinner />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Load;
