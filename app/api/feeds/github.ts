import type { FeedItem } from '../../../types';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

interface GithubEvent {
  id: string;
  type: string;
  actor: {
    login: string;
    id: number;
  };
  repo: {
    name: string;
  };
  created_at: string;
  payload: any; // 这里可以根据实际情况定义更具体的类型
}

export async function getGithubEvents(): Promise<FeedItem[]> {
  if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
    console.log('GitHub credentials not found');
    return [];
  }

  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('GitHub API error response:', error);
      throw new Error(`GitHub API failed: ${response.status} ${error}`);
    }

    const events: GithubEvent[] = await response.json();
    console.log('GitHub events received:', events.length);
    
    return events.map(event => {
      console.log('Event:', event);
      console.log('Event payload:', event.payload);
      return {
        id: event.id,
        site: 'GitHub',
        title: formatEventTitle(event),
        repoName: event.repo.name,
        time: formatTime(new Date(event.created_at)),
        processed: false,
        link: getGithubLink(event) // 添加链接
      };
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return [];
  }
}

// 新增的函数
function getGithubLink(event: GithubEvent): string {
  if (event.type === 'PushEvent') {
    const commitCount = event.payload.commits.length;
    if (commitCount === 1) {
      return `https://github.com/${event.repo.name}/commit/${event.payload.commits[0].sha}`;
    } else {
      return `https://github.com/${event.repo.name}/commits`;
    }
  } else if (event.type === 'PullRequestEvent' && event.payload.pull_request) {
    return `https://github.com/${event.repo.name}/pull/${event.payload.pull_request.number}`;
  } else if (event.type === 'IssuesEvent' && event.payload.issue) {
    return `https://github.com/${event.repo.name}/issues/${event.payload.issue.number}`;
  } else if (event.type === 'WatchEvent') {
    return `https://github.com/${event.repo.name}`;
  }
  return '#'; // 默认返回
}

function formatEventTitle(event: GithubEvent): string {
  switch (event.type) {
    case 'PushEvent':
      const commitCount = event.payload.commits.length;
      if (commitCount === 1) {
        const commit = event.payload.commits[0];
        return `${event.actor.login} pushed 1 commit: ${commit.message}`;
      } else {
        return `${event.actor.login} pushed ${commitCount} commits to ${event.repo.name}`;
      }
    case 'PullRequestEvent':
      if (event.payload && event.payload.pull_request) {
        return `${event.actor.login} ${event.payload.action} a pull request: ${event.payload.pull_request.title}`;
      } else {
        return `${event.actor.login} ${event.payload.action} a pull request in ${event.repo.name}`;
      }
    case 'WatchEvent':
      return `${event.actor.login} starred ${event.repo.name}`;
    case 'IssuesEvent':
      return `${event.actor.login} ${event.payload.action} an issue in ${event.repo.name}`;
    case 'ForkEvent':
      return `${event.actor.login} forked ${event.repo.name}`;
    default:
      return `${event.actor.login} performed a ${event.type} action in ${event.repo.name}`;
  }
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
} 