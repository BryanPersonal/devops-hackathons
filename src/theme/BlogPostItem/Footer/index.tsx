import React from 'react';
import Footer from '@theme-original/BlogPostItem/Footer';
import Giscus from '@giscus/react';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import {useColorMode, useThemeConfig} from '@docusaurus/theme-common';

type GiscusConfig = {
  repo?: string;
  repoId?: string;
  category?: string;
  categoryId?: string;
  mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number';
  strict?: '0' | '1';
  reactionsEnabled?: '0' | '1';
  emitMetadata?: '0' | '1';
  inputPosition?: 'top' | 'bottom';
  lang?: string;
  loading?: 'lazy' | 'eager';
};

export default function BlogPostFooter(props: Record<string, unknown>): JSX.Element {
  const {isBlogPostPage, metadata} = useBlogPost();
  const {colorMode} = useColorMode();
  const themeConfig = useThemeConfig() as {giscus?: GiscusConfig};
  const giscus = themeConfig.giscus;

  const hasRequiredGiscusConfig =
    Boolean(giscus?.repo) &&
    Boolean(giscus?.repoId) &&
    Boolean(giscus?.category) &&
    Boolean(giscus?.categoryId);

  return (
    <>
      <Footer {...props} />
      {isBlogPostPage && hasRequiredGiscusConfig ? (
        <div className="blogPostGiscus">
          <Giscus
            repo={giscus!.repo!}
            repoId={giscus!.repoId!}
            category={giscus!.category!}
            categoryId={giscus!.categoryId!}
            mapping={giscus?.mapping ?? 'pathname'}
            strict={giscus?.strict ?? '0'}
            reactionsEnabled={giscus?.reactionsEnabled ?? '1'}
            emitMetadata={giscus?.emitMetadata ?? '0'}
            inputPosition={giscus?.inputPosition ?? 'top'}
            theme={colorMode === 'dark' ? 'dark' : 'light'}
            lang={giscus?.lang ?? 'en'}
            loading={giscus?.loading ?? 'lazy'}
            term={metadata.permalink}
          />
        </div>
      ) : null}
    </>
  );
}
