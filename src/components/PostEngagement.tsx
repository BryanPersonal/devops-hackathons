import React, {useEffect} from 'react';
import Giscus from '@giscus/react';
import {useColorMode, useThemeConfig} from '@docusaurus/theme-common';

type PostEngagementProps = {
  postId?: string;
  postTitle?: string;
  enableComments?: boolean;
};

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

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function PostEngagement({
  postId,
  postTitle,
  enableComments = true,
}: PostEngagementProps): JSX.Element {
  const {colorMode} = useColorMode();
  const themeConfig = useThemeConfig() as {giscus?: GiscusConfig};
  const giscus = themeConfig.giscus;
  const hasRequiredGiscusConfig =
    Boolean(giscus?.repo) &&
    Boolean(giscus?.repoId) &&
    Boolean(giscus?.category) &&
    Boolean(giscus?.categoryId);

  useEffect(() => {
    const scriptId = 'busuanzi-script';
    if (document.getElementById(scriptId)) {
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
    document.body.appendChild(script);
  }, []);

  const onOpenFeedback = (): void => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'post_feedback_entry', {
        feedback_type: 'reactions_or_comment',
        post_id: postId ?? window.location.pathname,
        post_title: postTitle ?? document.title,
        page_path: window.location.pathname,
      });
    }

    const commentsEl = document.getElementById('post-comments');
    if (commentsEl) {
      commentsEl.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  };

  return (
    <section className="postEngagement">
      <div className="postEngagementHeader">
        <h3>Engagement</h3>
        <p>Share global feedback and join the discussion across all users.</p>
      </div>

      <div className="postEngagementMetrics">
        <div className="postMetric" id="busuanzi_container_page_pv">
          <span className="postMetricLabel">Views</span>
          <span className="postMetricValue" id="busuanzi_value_page_pv">
            -
          </span>
        </div>
        <div className="postMetric">
          <span className="postMetricLabel">Feedback Storage</span>
          <span className="postMetricValue">Global (Giscus)</span>
        </div>
      </div>

      <div className="postEngagementActions">
        <button type="button" className="postLikeButton" onClick={onOpenFeedback}>
          Open global reactions and comments
        </button>
        <span className="postLikeCount">
          All reactions and comments are persistent and visible across regions/devices.
        </span>
      </div>

      {enableComments ? (
        hasRequiredGiscusConfig ? (
          <div className="postComments" id="post-comments">
            <h4>Comments</h4>
            <Giscus
              repo={giscus!.repo! as `${string}/${string}`}
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
              term={postId}
            />
          </div>
        ) : (
          <p className="postCommentHint">
            Comments are enabled, but Giscus is not fully configured yet. Please set
            `repoId` and `categoryId` in `docusaurus.config.js`.
          </p>
        )
      ) : null}
    </section>
  );
}
