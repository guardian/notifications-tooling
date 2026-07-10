import { AlertBanner } from "@guardian/stand/AlertBanner";
import { Grid, Item } from "@guardian/stand/Grid";
import { Layout } from "@guardian/stand/Layout";
import { TopBar, TopBarToolName } from "@guardian/stand/TopBar";

export const LayoutComponent = () => (
  <Layout aria-label="Page layout">
    <Layout.AlertBanner as="div" role="status" aria-live="polite">
      <AlertBanner level="information">Layout banner message</AlertBanner>
    </Layout.AlertBanner>
    <Layout.TopBar>
      <TopBar>
        <TopBarToolName
          name="Notifications Tooling"
          favicon={{ letter: "N" }}
        />
      </TopBar>
    </Layout.TopBar>
    <Layout.Sidebar
      as="nav"
      aria-label="Secondary navigation"
      layoutSmBreakpoint="above-grid"
    >
      <div style={{ padding: "8px" }}>Sidebar content</div>
    </Layout.Sidebar>
    <Layout.Main fluid={false}>
      <Grid>
        <Item size={{ sm: 12, md: 8 }}>Main content</Item>
        <Item size={{ sm: 12, md: 4 }}>Secondary content</Item>
      </Grid>
    </Layout.Main>
  </Layout>
);
