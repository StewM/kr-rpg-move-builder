import "@mantine/core/styles.css";
import { Anchor, AppShell, Container, Group, MantineProvider } from "@mantine/core";
import { theme } from "./theme";

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <AppShell
        header={{ height: 60 }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Anchor href="/kr-rpg-move-builder" underline="never" size="xl">Kamen Rider RPG Move Builder</Anchor>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          <Container>
            Main
          </Container>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
    );
}
