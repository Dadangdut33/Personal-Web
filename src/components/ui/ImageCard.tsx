import { Image } from "@mantine/core";

type Props = {
  imageUrl: string;
  children: React.ReactNode;
};

// Base: https://neobrutalism-components.vercel.app/react/components/ImageCard
export default function ImageCard({ imageUrl, children }: Props) {
  return (
    <figure className="w-[250px] overflow-hidden rounded-base border-2 border-black bg-main font-base shadow-base">
      <Image className="w-full" src={imageUrl} alt="image" />
      <figcaption className="border-t-2 border-black p-4">{children}</figcaption>
    </figure>
  );
}
