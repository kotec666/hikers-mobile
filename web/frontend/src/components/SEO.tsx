import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
}

const SEO = ({ title, description }: SEOProps) => {
  useEffect(() => {
    // Обновляем заголовок страницы
    document.title = title;

    // Обновляем мета-тег description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    // Возвращаем функцию очистки
    return () => {
      // Если нужно сбросить мета-теги при размонтировании компонента
    };
  }, [title, description]);

  return null; // Этот компонент не рендерит никакой UI
};

export default SEO;
