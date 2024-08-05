type Props = {
  imageUrl: string;
  children: React.ReactNode;
};

// Base: https://www.neobrutalism.dev/react/components/image-card
export default function Card({ children }: Props) {
  return (
    <figure className="w-[250px] overflow-hidden rounded-base border-2 border-border dark:border-darkBorder bg-main font-base shadow-light dark:shadow-dark">
      {children}
    </figure>
  );
}
