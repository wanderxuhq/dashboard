import { NextResponse } from 'next/server';
import type { FeedItem } from '@/app/types';
import { getLatestEmails } from './email';
import { getGithubEvents } from './github';

export async function GET() {
  try {
    const [emailFeeds, githubFeeds] = await Promise.all([
      getLatestEmails(),
      getGithubEvents()
    ]);

    const allFeeds = [...emailFeeds, ...githubFeeds].map(feed => {
      if (feed.site === 'GitHub') {
        // 通过event类型判断
        switch (feed.type) {
          case 'PushEvent':
            // 处理PushEvent
            break;
          case 'PullRequestEvent':
            // 处理PullRequestEvent
            break;
          case 'IssuesEvent':
            // 处理IssuesEvent
            break;
          // 添加其他事件类型的处理
          default:
            break;
        }
      }
      return feed;
    });

    // 限制总数为最新的20条
    const sortedFeeds = allFeeds
      .sort((a, b) => {
        const timeA = getTimeStamp(a.time);
        const timeB = getTimeStamp(b.time);
        return timeB - timeA;  // 降序排序
      })
      .slice(0, 20);  // 只取前20条

    return NextResponse.json({ data: sortedFeeds });
  } catch (err) {
    return NextResponse.json(
      { error: '获取信息流失败' },
      { status: 500 }
    );
  }
}

// 将相对时间转换为时间戳
function getTimeStamp(timeStr: string): number {
  const now = Date.now();
  const match = timeStr.match(/(\d+)(天|小时|分钟)前/);
  
  if (!match) return now;  // "刚刚" 的情况
  
  const [, num, unit] = match;
  const value = parseInt(num);
  
  switch (unit) {
    case '天':
      return now - value * 24 * 60 * 60 * 1000;
    case '小时':
      return now - value * 60 * 60 * 1000;
    case '分钟':
      return now - value * 60 * 1000;
    default:
      return now;
  }
} 