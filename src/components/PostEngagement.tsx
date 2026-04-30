import React, {useEffect, useMemo, useState} from 'react';

type PostEngagementProps = {
  postId?: string;
};

export default function PostEngagement({
  postId,
}: PostEngagementProps): JSX.Element {
  const storageKey = useMemo(() => {
    const fallbackId =
      typeof window !== 'undefined' ? window.location.pathname : 'unknown-post';
    return `post-like:${postId ?? fallbackId}`;
  }, [postId]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return;
    }

    try {
      const data = JSON.parse(raw) as {liked: boolean; likeCount: number};
      setLiked(Boolean(data.liked));
      setLikeCount(Number(data.likeCount) || 0);
    } catch {
      setLiked(false);
      setLikeCount(0);
    }
  }, [storageKey]);

  const onLikeToggle = (): void => {
    const nextLiked = !liked;
    const nextLikeCount = Math.max(0, likeCount + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setLikeCount(nextLikeCount);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({liked: nextLiked, likeCount: nextLikeCount}),
      );
    }
  };

  return (
    <div className="postEngagement">
      <p id="busuanzi_container_page_pv" style={{marginBottom: '0.25rem'}}>
        Views: <span id="busuanzi_value_page_pv">-</span>
      </p>
      <button type="button" className="postLikeButton" onClick={onLikeToggle}>
        {liked ? 'Unlike' : 'Like'} ({likeCount})
      </button>
    </div>
  );
}
