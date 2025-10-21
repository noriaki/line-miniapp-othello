import React from 'react';
import { render } from '@testing-library/react';
import RootLayout, { metadata, viewport } from '../layout';

describe('RootLayout (Server Component)', () => {
  it('正しいメタデータを持つこと', () => {
    expect(metadata).toEqual({
      title: 'LINE Reversi - リバーシゲーム',
      description: 'LINEミニアプリで遊べるリバーシゲーム。AIと対戦しよう!',
    });
  });

  it('正しいviewport設定を持つこと', () => {
    expect(viewport).toEqual({
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
      themeColor: '#06C755',
    });
  });

  it('childrenを正しくレンダリングすること', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="child">Test Content</div>
      </RootLayout>
    );

    expect(container.querySelector('html')).toBeInTheDocument();
    expect(container.querySelector('body')).toBeInTheDocument();
    expect(
      container.querySelector('[data-testid="child"]')
    ).toBeInTheDocument();
  });

  it('lang属性が"ja"であること', () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const html = container.querySelector('html');
    expect(html).toHaveAttribute('lang', 'ja');
  });
});
