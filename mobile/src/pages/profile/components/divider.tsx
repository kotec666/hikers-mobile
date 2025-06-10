import { FC } from 'react'

interface DividerProps {}

const Divider: FC<DividerProps> = () => {
    return <div className=" w-full h-[1px] bg-neutral-200"></div>
}

export default Divider
