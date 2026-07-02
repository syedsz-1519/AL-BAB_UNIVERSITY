import { useEffect } from 'react';

interface SectionMetaTagsProps {
  title: string;
  description: string;
  sectionId: string;
}

export default function SectionMetaTags({ title, description, sectionId }: SectionMetaTagsProps) {
  useEffect(() => {
    // Preserve default values to restore on unmount if necessary
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

    // Update main page title
    document.title = `${title} | Albab Islamic University`;

    // Helper function to update or create meta tags
    const updateOrCreateMeta = (propertyOrName: string, content: string, isProperty = true) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${propertyOrName}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, propertyOrName);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update standard meta tags
    updateOrCreateMeta('description', description, false);

    // Update Open Graph (OG) tags
    updateOrCreateMeta('og:title', `${title} | Albab Islamic University`);
    updateOrCreateMeta('og:description', description);
    updateOrCreateMeta('og:url', `https://albab.university/#${sectionId}`);
    updateOrCreateMeta('og:type', 'article');

    // Update Twitter tags
    updateOrCreateMeta('twitter:title', `${title} | Albab Islamic University`);
    updateOrCreateMeta('twitter:description', description);

    return () => {
      // Restore defaults
      document.title = originalTitle;
      updateOrCreateMeta('description', originalDescription, false);
      updateOrCreateMeta('og:title', 'Albab Islamic University | Classical Seminary & Interactive Portal');
      updateOrCreateMeta('og:description', originalDescription);
      updateOrCreateMeta('og:url', 'https://albab.university');
      updateOrCreateMeta('og:type', 'website');
      updateOrCreateMeta('twitter:title', 'Albab Islamic University | Classical Seminary');
      updateOrCreateMeta('twitter:description', originalDescription);
    };
  }, [title, description, sectionId]);

  return null; // This is a utility component that doesn't render visual elements
}
