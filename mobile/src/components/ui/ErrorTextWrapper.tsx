import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface IProps extends React.PropsWithChildren {
	animated?: boolean;
}

interface IPropsInner extends React.PropsWithChildren {
}

const ErrorTextInnerContent = (props: IPropsInner) => {
	return (
		<>
			<div className="flex items-baseline gap-1">
				<div className=" translate-y-[3px]">
					<img src="/svg/err.svg" alt="err" />
				</div>

				<span className="p-text !leading-6 text-red-400">
						{props.children}
					</span>
			</div>
		</>
	)
}

const ErrorTextWrapper = ({ animated, children }: IProps) => {
	return (
		<AnimatePresence mode="popLayout">
			{animated === false ? (
				<div>
					<ErrorTextInnerContent>{children}</ErrorTextInnerContent>
				</div>
			) : (
				<motion.div
					initial={{
						height: 0,
						opacity: 0,
					}}
					animate={{
						height: 'auto',
						opacity: 1,
						transition: {
							height: {
								duration: 0.3,
							},
							opacity: {
								duration: 0.25,
								// delay: 0.15,
								delay: 0,
							},
						},
					}}
					exit={{
						height: 0,
						opacity: 0,
						transition: {
							height: {
								duration: 0.3,
							},
							opacity: {
								duration: 0.5,
								delay: 0,
							},
						},
					}}
				>
					<ErrorTextInnerContent>{children}</ErrorTextInnerContent>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default ErrorTextWrapper;
