'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import type { FeedItem } from './types';
import EmailPreview from './components/EmailPreview';

const defaultBookmarks = [
  { id: 1, title: 'Google', url: 'https://www.google.com' },
  { id: 2, title: 'YouTube', url: 'https://www.youtube.com' },
  { id: 3, title: 'GitHub', url: 'https://github.com' },
  { id: 4, title: 'Bilibili', url: 'https://www.bilibili.com' }
];

type TabType = 'unprocessed' | 'processed';
type FilterType = 'all' | 'Email' | 'GitHub' | 'Bilibili';

export default function DashboardPage() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<FeedItem | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('unprocessed');
  const [filter, setFilter] = useState<FilterType>('all');
  const [newItems, setNewItems] = useState<Set<string>>(new Set());

  const getFaviconUrl = (url: string) => {
    return `https://www.google.com/s2/favicons?domain=${url}&sz=32`;
  };

  const fetchFeeds = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/feeds');
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      setFeeds(result.data);
      setNewItems(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取信息流失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    const oldFeeds = feeds.map(feed => feed.id);
    await fetchFeeds();
    const newFeeds = feeds.filter(feed => !oldFeeds.includes(feed.id));
    const newIds = newFeeds.map(feed => feed.id);
    setNewItems(new Set(newIds));
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const unprocessedFeeds = feeds.filter(feed => !feed.processed);
  const processedFeeds = feeds.filter(feed => feed.processed);

  const handleEmailProcessed = (processedEmail: FeedItem) => {
    setFeeds(currentFeeds => 
      currentFeeds.map(feed => 
        feed.id === processedEmail.id 
          ? { ...feed, processed: true } 
          : feed
      )
    );
    setSelectedEmail(null);
  };

  const filteredFeeds = (activeTab === 'unprocessed' ? unprocessedFeeds : processedFeeds).filter(feed => {
    return filter === 'all' || feed.site === filter;
  });

  // 计算未处理和已处理的数量
  const unprocessedCount = filteredFeeds.filter(feed => !feed.processed).length;
  const processedCount = filteredFeeds.filter(feed => feed.processed).length;

  return (
    <div className={styles.dashboard}>
      <h1>我的仪表盘</h1>

      <div className={styles.bookmarkSection}>
        <h2>网址收藏</h2>
        <div className={styles.bookmarkList}>
          {defaultBookmarks.map(bookmark => (
            <a 
              key={bookmark.id}
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.bookmarkItem}
            >
              <img 
                src={getFaviconUrl(bookmark.url)}
                alt=""
                className={styles.favicon}
              />
              <span>{bookmark.title}</span>
            </a>
          ))}
        </div>
      </div>

      <div className={styles.feedSection}>
        <div className={styles.refreshAndFilter}>
          <button onClick={handleRefresh} className={styles.refreshButton}>
            <i className="fas fa-sync-alt"></i> 刷新
          </button>
          <div className={styles.filterSection}>
            <div onClick={() => setFilter('all')} className={`${filter === 'all' ? styles.activeFilter : ''} ${styles.filterButton}`}>
              <img src="/icons/all-icon.png" alt="全部" className={styles.filterIcon} />
            </div>
            <div onClick={() => setFilter('Email')} className={`${filter === 'Email' ? styles.activeFilter : ''} ${styles.filterButton}`}>
              <img src="/icons/gmail.ico" alt="Gmail" className={styles.filterIcon} />
            </div>
            <div onClick={() => setFilter('GitHub')} className={`${filter === 'GitHub' ? styles.activeFilter : ''} ${styles.filterButton}`}>
              <img src="/icons/github.ico" alt="GitHub" className={styles.filterIcon} />
            </div>
            <div onClick={() => setFilter('Bilibili')} className={`${filter === 'Bilibili' ? styles.activeFilter : ''} ${styles.filterButton}`}>
              <img src="/icons/bilibili-icon.png" alt="Bilibili" className={styles.filterIcon} />
            </div>
          </div>
        </div>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'unprocessed' ? styles.active : ''}`}
            onClick={() => setActiveTab('unprocessed')}
          >
            未处理 ({unprocessedCount})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'processed' ? styles.active : ''}`}
            onClick={() => setActiveTab('processed')}
          >
            已处理 ({processedCount})
          </button>
        </div>
        <div className={styles.feedList}>
          {isLoading ? (
            <div className={styles.loading}>加载中...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : filteredFeeds.length === 0 ? (
            <div className={styles.empty}>暂无信息</div>
          ) : (
            filteredFeeds.map(item => (
              <div 
                key={item.id}
                className={`${styles.feedItem} ${newItems.has(item.id) ? styles.newItem : ''}`}
                style={{ cursor: item.site === 'Email' ? 'pointer' : 'default' }}
              >
                <a 
                  href={item.link}
                  target={item.site === 'GitHub' ? '_blank' : undefined}
                  rel={item.site === 'GitHub' ? 'noopener noreferrer' : undefined}
                  onClick={item.site === 'Email' ? () => setSelectedEmail(item) : undefined}
                >
                  <div className={styles.feedHeader}>
                    <img 
                      src={item.site === 'Email' ? '/icons/gmail.ico' : item.site === 'GitHub' ? '/icons/github.ico' : getFaviconUrl(item.url)}
                      alt={item.site === 'Email' ? 'Gmail' : item.site === 'GitHub' ? 'GitHub' : '网站图标'}
                      className={styles.favicon}
                    />
                    <span className={styles.siteName}>{item.site}</span>
                    {item.from && <span className={styles.from}>来自: {item.from}</span>}
                    <span className={styles.feedTime}>{item.time}</span>
                  </div>
                  <div className={styles.feedTitle}>{item.title}</div>
                </a>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedEmail && (
        <EmailPreview 
          email={selectedEmail} 
          onClose={() => setSelectedEmail(null)}
          onProcessed={handleEmailProcessed}
        />
      )}
    </div>
  );
}
