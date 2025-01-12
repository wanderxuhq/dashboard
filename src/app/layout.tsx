import './globals.css';
import './page.module.css';
import { useEffect, useState } from 'react';

export default function Layout({ children }) {
  const [bgColor1, setBgColor1] = useState<string>('');
  const [bgColor2, setBgColor2] = useState<string>('');

  // 生成柔和的随机颜色
  const getRandomSoftColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, 0.7)`; // 使用 rgba 使颜色更柔和
  };

  // 设置随机背景色
  useEffect(() => {
    const color1 = getRandomSoftColor();
    const color2 = getRandomSoftColor();
    setBgColor1(color1);
    setBgColor2(color2);
  }, []);

  return (
    <html lang="en">
      <body style={{
        background: `linear-gradient(45deg, ${bgColor1}, ${bgColor2})`,
        height: '100vh',
        margin: 0,
        transition: 'background 1s ease' // 添加过渡效果
      }}>
        {children}
      </body>
    </html>
  );
} 