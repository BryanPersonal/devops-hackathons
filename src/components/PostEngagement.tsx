import React, {useEffect} from 'react';

type PostEngagementProps = {
  showLikeHint?: boolean;
};

export default function PostEngagement({
  showLikeHint = true,
}: PostEngagementProps): JSX.Element {
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

  return (
    <div className="postEngagement">
      <p id="busuanzi_container_page_pv" style={{marginBottom: '0.25rem'}}>
        👀 阅览量: <span id="busuanzi_value_page_pv">-</span>
      </p>
      {showLikeHint ? (
        <p style={{marginBottom: 0}}>👍 点赞: 可在页面底部 Giscus 区域点击 Reactions</p>
      ) : null}
    </div>
  );
}
