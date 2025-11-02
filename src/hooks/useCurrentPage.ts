import { usePathname } from "next/navigation";

type Params = {
  src: string;
  comparisonFn?: (pathname: string, currentPage: string) => boolean;
};

export const useCurrentPage = ({ src, comparisonFn }: Params): boolean => {
  const pathname = usePathname();
  const currentPage = new URL(`${window.location.origin}${src}`).pathname;
  return comparisonFn ? comparisonFn(pathname, currentPage) : pathname === currentPage;
};
