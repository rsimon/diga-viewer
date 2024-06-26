import { useMemo } from 'react';
import type { Annotation } from '@annotorious/react';
import Fuse from 'fuse.js';

interface FuseAnnotationDocument {

  annotationId: string;

  tags: string[];

}

export const useTagSearch = (annotations: Annotation[]) => {

  const annotationsById = useMemo(() => 
      new Map(annotations.map(a => ([a.id, a]))), [annotations]);

  const tagIndex: Fuse<string> = useMemo(() => { 
    const distinctTags = new Set(annotations.reduce<string[]>((all, annotation) => {
      const tags = annotation.bodies.filter(b => b.purpose === 'tagging' && b.value);
      return [...all, ...tags.map(b => b.value!)];
    }, []));

    return new Fuse<string>([...distinctTags], {
      shouldSort: true,
      threshold: 0.5
    });
  }, [annotations]);

  const annotationIndex: Fuse<FuseAnnotationDocument> = useMemo(() => {
    const documents: FuseAnnotationDocument[] = annotations.map(a => {
      const annotationId = a.id;
  
      const tags: string[] = a.bodies
        .filter(b => b.purpose === 'tagging' && b.value)
        .map(b => b.value!);
  
      return { annotationId, tags };
    }).filter(d => d.tags.length > 0);

    return new Fuse<FuseAnnotationDocument>(documents, { 
      keys: ['tags'],
      shouldSort: true,
      threshold: 0.2
    });
  }, [annotations]);

  const search = (query: string, limit?: number): Annotation[] =>
    annotationIndex.search(query, { limit: limit || 500 })
      .map(r => annotationsById.get(r.item.annotationId)!)
      .filter(Boolean);

  const getSuggestions = (query: string, limit?: number): string[] =>
    tagIndex.search(query, { limit: limit || 10 })
      .map(r => r.item);

  return { search, getSuggestions };

}