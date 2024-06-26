import { useCallback, useEffect } from 'react';
import { useAnnotator } from '@annotorious/react';
import type { Annotation } from '@annotorious/react';
import { TextAnnotator, W3CTextFormat } from '@recogito/react-text-annotator';
import type { HighlightStyle, RecogitoTextAnnotator, TextAnnotation, W3CTextAnnotation } from '@recogito/react-text-annotator';
import { useRelated, useSelected } from '@lib/hooks';
import { useNarrativeTerms } from '../_hooks';
import { VerseAnnotationPopup } from './VerseAnnotationPopup';
import type { Selected } from 'src/Types';

import './AnnotatedVerse.css';
import '@recogito/react-text-annotator/react-text-annotator.css';

interface AnnotatedVerseProps {

  annotations: W3CTextAnnotation[];

  highlightedSearchResult?: TextAnnotation;

  searchResults: Annotation[];

  verse: string;

  onSelect(selected: Selected): void;

  onOpenRelatedImages(): void;

  onOpenRelatedVerses(): void;

}

export const AnnotatedVerse = (props: AnnotatedVerseProps) => {

  const { searchResults, highlightedSearchResult } = props;

  const anno = useAnnotator<RecogitoTextAnnotator<W3CTextAnnotation>>();

  const selected = useSelected<TextAnnotation>();

  const { images, verses } = useRelated(selected);

  const narrative = useNarrativeTerms();

  const style = useCallback((a: Annotation) => {
    const isSection = a.bodies.find(b => b.value && narrative!.has(b.value));

    const baseStyle: HighlightStyle = isSection ? {
      fill: '#000',
      fillOpacity: 0.05
    } : {
      fill: '#ff5e5e',
      fillOpacity: 0.4,
      underlineThickness: 2,
      underlineColor: '#e05252'
    };

    if (searchResults.length === 0) {
      return baseStyle;
    } else if (a.id === highlightedSearchResult?.id) {
      return {
        ...baseStyle,
        fill: '#ff9100',
        underlineColor: '#ca852b'
      } as HighlightStyle;
    } else {  
      const resultIds = new Set(searchResults.map(a => a.id));

      return resultIds.has(a.id) ? {
        ...baseStyle,
        fill: '#fff800',
        underlineColor: '#caca2b'
      } as HighlightStyle : baseStyle;
    }
  }, [narrative, searchResults, highlightedSearchResult]);

  useEffect(() => {
    if (!anno) return;
      anno.setAnnotations(props.annotations);
  }, [anno, props.annotations]);

  useEffect(() => {
    if (props.highlightedSearchResult)
      anno.scrollIntoView(props.highlightedSearchResult);
  }, [props.highlightedSearchResult]);

  useEffect(() => {
    props.onSelect({ 
      annotation: selected, 
      relatedImages: images, 
      relatedVerses: verses
    });
  }, [selected, images, verses]);

  return narrative && (
    <TextAnnotator
      adapter={container => W3CTextFormat('5db80aa5-8a27-4539-aeb3-bddf3abc0098', container)}
      annotationEnabled={false}
      style={style}>
      
      <div className="annotated-text">
        {props.verse}
      </div>

      <VerseAnnotationPopup 
        annotation={selected} 
        relatedImages={images} 
        relatedVerses={verses} 
        onClickImages={props.onOpenRelatedImages}
        onClickVerses={props.onOpenRelatedVerses} />
    </TextAnnotator>
  )

}