'use client';

import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import styles from './EmailPreview.module.css';
import type { FeedItem } from '../types';

interface EmailPreviewProps {
  email: FeedItem;
  onClose: () => void;
  onProcessed: (email: FeedItem) => void;
}

export default function EmailPreview({ email, onClose, onProcessed }: EmailPreviewProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (email.uid) {
      fetch('/api/emails/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: email.uid }),
      })
        .then(() => onProcessed(email))
        .catch(console.error);
    }
  }, [email, onProcessed]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (contentRef.current && email.html) {
      // 安全地渲染 HTML 内容
      const cleanHtml = DOMPurify.sanitize(email.html, {
        USE_PROFILES: { html: true },
        ALLOWED_TAGS: [
          'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'img',
          'div', 'span', 'table', 'tr', 'td', 'th', 'tbody', 'thead'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'style', 'class']
      });
      contentRef.current.innerHTML = cleanHtml;
    }
  }, [email.html]);

  return (
    <div className={styles.overlay}>
      <div ref={modalRef} className={styles.modal}>
        <div className={styles.header}>
          <h2>{email.title.replace('[未读] ', '')}</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <div className={styles.metadata}>
          <span>发件人: {email.from}</span>
          <span>时间: {email.time}</span>
        </div>
        <div 
          ref={contentRef} 
          className={styles.content}
        >
          {!email.html && email.content}
        </div>
      </div>
    </div>
  );
} 