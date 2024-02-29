import { Text } from "@mantine/core";
import { Footer } from "@root/components/public/Footer";
import { HeaderMenu } from "@root/components/public/Header";
import { Wrapper } from "@root/components/public/Wrapper";
import { ColorSchemeToggle } from "@root/components/utils/ColorSchemeToggle";

export default function HomePage(test: any) {
  return (
    <Wrapper>
      <div>projects pagea</div>
      <Text c={"#2978b5"} style={{ textDecoration: "none" }} fw={900} size="16 px">
        test projects
      </Text>
    </Wrapper>
  );
}
