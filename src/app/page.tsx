import { MainContainer } from "@/components/MainContainer";

export default function Page() {
  return (
    <div className="flex flex-col">
      <MainContainer />
      <div className="flex mt-auto pb-3">Footer</div>
    </div>
  );
}
