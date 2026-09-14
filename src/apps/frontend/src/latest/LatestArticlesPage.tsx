import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import { useLatestArticles } from '../hooks/useLatestArticles';
import { historyViewStyles, layoutMainTheme } from '../themes';
import { LastUpdated } from '../ui/LastUpdated';
import { RefreshButton } from '../ui/RefreshButton';
import {
	LatestArticlesTable,
	LatestArticlesTableSkeleton,
} from './LatestArticlesTable';

export const LatestArticlesPage = () => {
	const latestArticles = useLatestArticles();

	return (
		<Layout.Main theme={layoutMainTheme}>
			<section
				aria-labelledby="latest-articles-heading"
				css={historyViewStyles.container}
			>
				<div css={historyViewStyles.header}>
					<div css={historyViewStyles.titleBlock}>
						<Typography
							id="latest-articles-heading"
							element="h1"
							variant="headingLg"
						>
							Latest articles
						</Typography>
					</div>
					{!latestArticles.isPending && !latestArticles.isError && (
						<div css={historyViewStyles.headerActions}>
							<div css={historyViewStyles.refreshControls}>
								{latestArticles.dataUpdatedAt > 0 && (
									<LastUpdated
										updatedAt={new Date(
											latestArticles.dataUpdatedAt,
										).toISOString()}
									/>
								)}
								<RefreshButton
									onRefresh={() => void latestArticles.refetch()}
									isRefreshing={latestArticles.isFetching}
								/>
							</div>
						</div>
					)}
				</div>
				{latestArticles.isPending && <LatestArticlesTableSkeleton />}
				{latestArticles.isError && (
					<InlineMessage level="error">
						Unable to load the latest articles. Try again.
					</InlineMessage>
				)}
				{latestArticles.data && latestArticles.data.results.length > 0 && (
					<LatestArticlesTable articles={latestArticles.data.results} />
				)}
				{latestArticles.data?.results.length === 0 && (
					<div css={historyViewStyles.empty}>
						<div css={historyViewStyles.emptyIcon} aria-hidden="true">
							<Typography variant="headingSm">0</Typography>
						</div>
						<Typography element="h2" variant="headingSm">
							No recent articles
						</Typography>
						<Typography
							variant="bodyMd"
							cssOverrides={historyViewStyles.emptyCopy}
						>
							Newly published articles will appear here.
						</Typography>
					</div>
				)}
			</section>
		</Layout.Main>
	);
};
