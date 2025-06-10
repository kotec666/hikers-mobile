import { PropsWithChildren } from 'react'
import { motion, PanInfo, useDragControls, Variants } from 'framer-motion'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils.ts'
import { Capacitor } from '@capacitor/core'

interface Props extends PropsWithChildren {
  handleClose: () => void
  className?: string
  variant: 'line' | 'cross'
  full?: boolean
  notDraggableChildren?: boolean
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const panelVariants: Variants = {
  hidden: { y: 1000 },
  visible: {
    y: 0,
  },
}
const DraggablePopover = (props: Props) => {
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const closePosition =
      Capacitor.getPlatform() === 'ios'
        ? {
          posUp: 70,
         // posDown: -100,
        }
        : {
          posUp: 40,
         // posDown: -60,
        }
    if (
      info.offset.y > closePosition.posUp // ||
      // info.offset.y < closePosition.posDown
    ) {
      props?.handleClose()
    }
  }

  // useEffect(() => {
  // 	document.body.style.overflow = "hidden"
  // 	return () => {
  // 		document.body.style.overflow = ""
  // 	}
  // }, [])

  const controls = useDragControls()

  return createPortal(
    <>
      <motion.div
        className={cn(
          'fixed min-w-full z-[11] top-0 inset-0 bg-black bg-opacity-25 max-h-[100vh]',
          // {
          // 	"cursor-pointer": props.notDraggableChildren,
          // },
          props.className,
        )}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={() => props?.handleClose()}
        variants={overlayVariants}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300,
        }}
      />
      <motion.div
        className={cn(
          'fixed min-w-full z-[101] top-0 inset-0 bg-opacity-25 max-h-[100vh]',
          // {
          // 	"cursor-pointer": props.notDraggableChildren,
          // },
          props.className,
        )}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={() => props?.handleClose()}
        variants={overlayVariants}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300,
        }}
      />
      <motion.div
        className={cn(
          'flex flex-col justify-center fixed w-full left-0 right-0 bottom-0 m-auto z-[101] max-h-[85vh] select-none',
          { 'bottom-[40px]': Capacitor.getPlatform() === 'ios' }, // overflow-y-scroll
          props.className,
        )}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={panelVariants}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300,
        }}
        drag="y"
        dragConstraints={{
          top: 0,
          bottom: 0,
        }}
        dragElastic={{
          top: 0,
          bottom: 0.5,
        }}
        onDragEnd={handleDragEnd}
        whileDrag={{ opacity: 0.9 }}
        dragControls={controls}
        dragListener={
          props.notDraggableChildren
            ? !props.notDraggableChildren
            : true
        }

        // style={{
        // 	touchAction: `${props.notDraggableChildren ? "initial" : "none"}`,
        // }} // To support touch screens, the triggering element should have the touch-action: none style applied.
      >
        <div
          className="w-full flex cursor-grab active:cursor-grabbing justify-center pt-[10px] pb-[8px]"
          onPointerDown={
            props.notDraggableChildren
              ? (e) => controls.start(e)
              : () => {
              }
          }
          style={{
            touchAction: 'none',
          }} // To support touch screens, the triggering element should have the touch-action: none style applied.
        >
          <span className="block border-b-[6px] rounded-full w-[64px] border-b-[#D4D4D4]" />
        </div>
        <div
          className={cn(
            'height-[calc(100%-2rem)] relative overflow-x-hidden overflow-y-scroll custom__transparent__scrollbar bg-white rounded-t-[20px] py-[24px] px-[30px]',
            {
              'w-full': props.full,
            },
          )}
          style={{
            touchAction: 'none',
          }} // To support touch screens, the triggering element should have the touch-action: none style applied.
        >
          {props?.children}
        </div>
      </motion.div>
    </>,
    document.body,
  )
}

export default DraggablePopover
