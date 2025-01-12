'use client';

import React from 'react';
import styles from './BookmarkList.module.css';

export default function BookmarkList({ bookmarks, setBookmarks }) {
  const handleDelete = (id) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
  };

  return (
    <div className={styles.bookmarkList}>
      {bookmarks.map(bookmark => (
        <div key={bookmark.id} className={styles.bookmarkItem}>
          <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
            {bookmark.title}
          </a>
          <button onClick={() => handleDelete(bookmark.id)} className={styles.deleteBtn}>
            删除
          </button>
        </div>
      ))}
    </div>
  );
} 