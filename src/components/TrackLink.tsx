import React from 'react';

type TrackLinkProps = {
  to: string;
  children: React.ReactNode;
  postSlug?: string;
  className?: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function TrackLink({
  to,
  children,
  postSlug,
  className,
}: TrackLinkProps): JSX.Element {
  const isExternal = /^https?:\/\//.test(to);

  const onClick = (): void => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
      return;
    }

    window.gtag('event', 'blog_link_click', {
      post_slug: postSlug ?? 'unknown-post',
      target_url: to,
      link_text: typeof children === 'string' ? children : 'mdx-link',
    });
  };

  return (
    <a
      href={to}
      className={className}
      onClick={onClick}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}>
      {children}
    </a>
  );
}
