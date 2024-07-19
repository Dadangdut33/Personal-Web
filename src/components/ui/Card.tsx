type Props = {
  imageUrl: string;
  children: React.ReactNode;
};

export default function Card({ children }: Props) {
  return (
    <figure className="w-[250px] overflow-hidden rounded-base border-2 border-black bg-main font-base shadow-base">
      {children}
    </figure>
  );
}
