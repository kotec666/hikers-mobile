import { FC } from 'react'

interface UserCardProps {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  avatar?: string | null | FileList;
}

const UserCard: FC<UserCardProps> = (props: UserCardProps) => {
    return (
        <div className="flex items-center gap-4 w-full">
          {props.avatar && (
            <div className=" relative w-20 h-20 rounded-full overflow-hidden">
              <img
                className=" absolute top-0 bottom-0 left-0 right-0"
                src={props.avatar as string}
                alt="user"
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <h2 className="h3-text font-semibold text-neutral-800">
              {props.firstName}&nbsp;{props.lastName}
            </h2>
            <p className="p-text text-neutral-500">{props.email}</p>
            </div>
        </div>
    )
}

export default UserCard
