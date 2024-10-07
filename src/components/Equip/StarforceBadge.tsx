import { StarIcon } from "../svg/StarIcon";

type Props = {
  isAmazingForce?: boolean;
  starforce: string;
};
export const StarforceBadge = ({ isAmazingForce, starforce }: Props) => (
  <div
    className={`flex justify-center items-center font-bold text-sm ${
      isAmazingForce ? "text-sky-400" : "text-yellow-400"
    }`}
  >
    <StarIcon isAmazingForce={isAmazingForce} />
    {` x ${starforce}`}
  </div>
);
