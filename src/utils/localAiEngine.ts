import {
  ChapterSummary,
  DefinitionItem,
  Flashcard,
  PracticeExam,
  QuizQuestion,
  StudySummary,
} from '../types';

// Common English stopwords to ignore during semantic keyword extraction
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isn', 'it', 'its', 'itself', 'just', 'me', 'more',
  'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your',
]);

/**
 * Splits text into sentences cleanly
 */
function splitIntoSentences(text: string): string[] {
  return text
    .replace(/([.?!])\s*(?=[A-Z0-9])/g, '$1|')
    .split('|')
    .map((s) => s.trim().replace(/\s+/g, ' '))
    .filter((s) => s.length > 25);
}

/**
 * Splits text into paragraphs
 */
function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 40);
}

/**
 * Calculates term frequencies across text
 */
function computeTermFrequencies(sentences: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const sentence of sentences) {
    const words = sentence
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

    for (const w of words) {
      tf.set(w, (tf.get(w) || 0) + 1);
    }
  }
  return tf;
}

/**
 * Detects definition patterns in a sentence
 */
function extractDefinitionFromSentence(sentence: string): DefinitionItem | null {
  const patterns = [
    // "X is defined as Y"
    /^([A-Z][a-zA-Z0-9\s-]{2,40})\s+(?:is|are)\s+defined\s+as\s+(.+)$/i,
    // "X refers to Y"
    /^([A-Z][a-zA-Z0-9\s-]{2,40})\s+(?:refers\s+to|means|denotes)\s+(.+)$/i,
    // "X: Y"
    /^([A-Z][a-zA-Z0-9\s-]{2,35}):\s+(.+)$/,
    // "X is the process/concept of Y"
    /^([A-Z][a-zA-Z0-9\s-]{2,40})\s+(?:is|are)\s+(?:the\s+)?(?:process|method|system|concept|structure|principle|organelle|algorithm|theory)\s+(?:of|by\s+which|that)\s+(.+)$/i,
  ];

  for (const pat of patterns) {
    const match = sentence.match(pat);
    if (match && match[1] && match[2]) {
      const term = match[1].trim();
      const def = match[2].trim();
      if (term.split(' ').length <= 5 && def.length > 20) {
        return {
          term,
          definition: def.endsWith('.') ? def : def + '.',
          importance: 'Core Terminology',
        };
      }
    }
  }
  return null;
}

/**
 * Identifies key concepts and definitions across text
 */
function extractAllDefinitions(sentences: string[]): DefinitionItem[] {
  const definitions: DefinitionItem[] = [];
  const seenTerms = new Set<string>();

  for (const sentence of sentences) {
    const def = extractDefinitionFromSentence(sentence);
    if (def && !seenTerms.has(def.term.toLowerCase())) {
      seenTerms.add(def.term.toLowerCase());
      definitions.push(def);
    }
  }

  // If few explicit patterns matched, extract strong term candidates using quotes or capitalization
  if (definitions.length < 5) {
    for (const sentence of sentences) {
      const boldOrColon = sentence.match(/^([^.?!:]{3,35}):\s*(.+)$/);
      if (boldOrColon && boldOrColon[1].length < 35 && boldOrColon[2].length > 20) {
        const term = boldOrColon[1].trim();
        if (!seenTerms.has(term.toLowerCase()) && !term.toLowerCase().startsWith('page')) {
          seenTerms.add(term.toLowerCase());
          definitions.push({
            term,
            definition: boldOrColon[2].trim(),
            importance: 'Key Concept',
          });
        }
      }
    }
  }

  return definitions;
}

/**
 * Segments a document into logical chapters/sections
 */
function segmentIntoChapters(rawText: string, paragraphs: string[]): Array<{ title: string; content: string[] }> {
  const sections: Array<{ title: string; content: string[] }> = [];
  let currentTitle = 'Section 1: Foundations & Core Concepts';
  let currentParagraphs: string[] = [];

  const headerRegex = /^(?:chapter\s+\d+|section\s+\d+|unit\s+\d+|part\s+[ivx\d]+|[0-9]+\.[0-9]*\s+[a-z]|topic\s+\d+|[A-Z\s]{4,40}$)/i;

  for (const p of paragraphs) {
    const lines = p.split('\n');
    const firstLine = lines[0].trim();

    if (lines.length > 1 && (headerRegex.test(firstLine) || firstLine.length < 50 && firstLine.endsWith(':'))) {
      if (currentParagraphs.length > 0) {
        sections.push({
          title: currentTitle,
          content: [...currentParagraphs],
        });
        currentParagraphs = [];
      }
      currentTitle = firstLine.replace(/[:#]/g, '').trim();
      currentParagraphs.push(lines.slice(1).join(' '));
    } else {
      currentParagraphs.push(p);
    }
  }

  if (currentParagraphs.length > 0) {
    sections.push({
      title: currentTitle,
      content: currentParagraphs,
    });
  }

  // If no natural headers were split, chunk paragraphs evenly into 3-4 cohesive sections
  if (sections.length <= 1 && paragraphs.length >= 6) {
    const chunkCount = Math.min(4, Math.ceil(paragraphs.length / 4));
    const chunkSize = Math.ceil(paragraphs.length / chunkCount);
    const result: Array<{ title: string; content: string[] }> = [];

    const defaultTitles = [
      'Core Principles & Overview',
      'Detailed Mechanics & Methods',
      'Advanced Concepts & Applications',
      'Synthesis & Key Implications',
    ];

    for (let i = 0; i < chunkCount; i++) {
      const slice = paragraphs.slice(i * chunkSize, (i + 1) * chunkSize);
      if (slice.length > 0) {
        result.push({
          title: defaultTitles[i] || `Section ${i + 1}: Subject Deep Dive`,
          content: slice,
        });
      }
    }
    return result;
  }

  return sections;
}

/**
 * Score and extract top representative sentences
 */
function rankSentences(sentences: string[], tf: Map<string, number>, count = 4): string[] {
  const scored = sentences.map((sentence) => {
    let score = 0;
    const words = sentence.toLowerCase().split(/\s+/);
    for (const w of words) {
      if (tf.has(w)) {
        score += tf.get(w)!;
      }
    }
    // Boost for high-value pedagogical markers
    if (/crucial|important|essential|fundamental|significant|in conclusion|primary|defined|principle/i.test(sentence)) {
      score *= 1.4;
    }
    // Penalize extreme lengths
    if (sentence.length < 40 || sentence.length > 300) {
      score *= 0.6;
    }
    return { sentence, score: score / Math.sqrt(words.length) };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.sentence);
}

/**
 * Generates an in-browser detailed summary without external API
 */
export function generateLocalSummary(documentTitle: string, rawText: string): StudySummary {
  const paragraphs = splitIntoParagraphs(rawText);
  const allSentences = splitIntoSentences(rawText);
  const tf = computeTermFrequencies(allSentences);
  const definitions = extractAllDefinitions(allSentences);
  const rawSections = segmentIntoChapters(rawText, paragraphs);

  const topOverviewSentences = rankSentences(allSentences, tf, 5);
  const overview =
    topOverviewSentences.join(' ') ||
    `This document contains foundational concepts and study materials on ${documentTitle}. It systematically covers principles, structural mechanisms, and real-world applications.`;

  const chapters: ChapterSummary[] = rawSections.map((sec, idx) => {
    const secText = sec.content.join(' ');
    const secSentences = splitIntoSentences(secText);
    const secTf = computeTermFrequencies(secSentences);
    const topSentences = rankSentences(secSentences, secTf, 4);

    const secDefs = definitions.filter((d) =>
      secText.toLowerCase().includes(d.term.toLowerCase())
    );

    // Extract formulas or laws
    const formulasOrRules: string[] = [];
    for (const s of secSentences) {
      if (/(?:formula|equation|law of|theorem|rule of|principle of|\=|\%|\^)/i.test(s) && s.length < 150) {
        formulasOrRules.push(s);
        if (formulasOrRules.length >= 3) break;
      }
    }

    return {
      chapterNumber: idx + 1,
      title: sec.title || `Chapter ${idx + 1}`,
      summary:
        topSentences.length > 0
          ? topSentences.join(' ')
          : sec.content.slice(0, 2).join(' '),
      keyTakeaways:
        topSentences.length > 0
          ? topSentences.slice(0, 3)
          : ['Understand primary definitions', 'Review core mechanisms', 'Analyze key examples'],
      definitions: secDefs.length > 0 ? secDefs : definitions.slice(0, 2),
      formulasOrRules: formulasOrRules.length > 0 ? formulasOrRules : undefined,
    };
  });

  return {
    overview,
    chapters,
    glossary: definitions.length > 0 ? definitions.slice(0, 15) : [
      {
        term: documentTitle,
        definition: 'Primary subject matter of the uploaded course material.',
      },
    ],
    studyTips: [
      'Focus on the high-yield definitions highlighted in each chapter.',
      'Active recall: flip through flashcards before attempting the practice exam.',
      'Explain the core processes out loud to verify comprehensive understanding.',
      'Review wrong quiz questions to target weaker knowledge areas.',
    ],
    generatedWith: 'local',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generates flashcards in the browser using local semantic extraction
 */
export function generateLocalFlashcards(rawText: string, count = 12): Flashcard[] {
  const sentences = splitIntoSentences(rawText);
  const definitions = extractAllDefinitions(sentences);
  const tf = computeTermFrequencies(sentences);
  const cards: Flashcard[] = [];
  const seenTerms = new Set<string>();

  // 1. Convert found definitions into flashcards
  for (const def of definitions) {
    if (cards.length >= count) break;
    seenTerms.add(def.term.toLowerCase());
    cards.push({
      id: `local-card-${cards.length + 1}-${Date.now()}`,
      front: `What is ${def.term}?`,
      back: def.definition,
      hint: `Pertains to ${def.importance || 'core principles'}.`,
      category: 'Key Definitions',
      difficulty: def.definition.length > 120 ? 'medium' : 'easy',
      status: 'new',
      reviewCount: 0,
    });
  }

  // 2. Convert top relational sentences into active recall questions
  if (cards.length < count) {
    const ranked = rankSentences(sentences, tf, count * 2);
    for (const sentence of ranked) {
      if (cards.length >= count) break;
      // Find prominent word
      const words = sentence
        .split(/\s+/)
        .map((w) => w.replace(/[^a-zA-Z]/g, ''))
        .filter((w) => w.length > 4 && tf.has(w.toLowerCase()) && !STOP_WORDS.has(w.toLowerCase()));

      if (words.length > 0) {
        const keyword = words[0];
        if (!seenTerms.has(keyword.toLowerCase())) {
          seenTerms.add(keyword.toLowerCase());
          cards.push({
            id: `local-card-${cards.length + 1}-${Date.now()}`,
            front: `What is the significance or function of "${keyword}" in this context?`,
            back: sentence,
            hint: `Think about how ${keyword} impacts the broader system described in the text.`,
            category: 'Concepts & Principles',
            difficulty: 'medium',
            status: 'new',
            reviewCount: 0,
          });
        }
      }
    }
  }

  return cards;
}

/**
 * Generates multiple-choice quiz questions locally using text extraction & intelligent distractors
 */
export function generateLocalQuiz(
  rawText: string,
  count = 5,
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed'
): QuizQuestion[] {
  const sentences = splitIntoSentences(rawText);
  const definitions = extractAllDefinitions(sentences);
  const tf = computeTermFrequencies(sentences);
  const rankedSentences = rankSentences(sentences, tf, count * 3);

  // Pool of candidate terms to construct authentic distractors
  const allTerms = Array.from(
    new Set([
      ...definitions.map((d) => d.term),
      ...Array.from(tf.keys())
        .filter((k) => k.length > 4)
        .slice(0, 30)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1)),
    ])
  );

  const questions: QuizQuestion[] = [];
  let index = 0;

  // Generate definition-based questions
  for (const def of definitions) {
    if (questions.length >= count) break;
    const correctTerm = def.term;
    const distractors = allTerms
      .filter((t) => t.toLowerCase() !== correctTerm.toLowerCase())
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    if (distractors.length === 3) {
      const options = [...distractors, correctTerm].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(correctTerm);

      questions.push({
        id: `local-q-${index + 1}-${Date.now()}`,
        question: `Which of the following terms is defined as: "${def.definition}"?`,
        options,
        correctIndex,
        explanation: `${correctTerm} is explicitly defined in the text as: "${def.definition}". The other choices refer to distinct concepts in the curriculum.`,
        difficulty: index % 2 === 0 ? 'easy' : 'medium',
        topic: 'Terminology & Definitions',
      });
      index++;
    }
  }

  // Generate statement-based comprehension questions
  for (const sentence of rankedSentences) {
    if (questions.length >= count) break;
    
    // Create a cloze or statement verification question
    const words = sentence.split(/\s+/).filter((w) => w.length > 4 && !STOP_WORDS.has(w.toLowerCase()));
    if (words.length > 2) {
      const targetWord = words[0].replace(/[^a-zA-Z]/g, '');
      const otherWords = allTerms
        .filter((t) => t.toLowerCase() !== targetWord.toLowerCase())
        .slice(0, 3);

      if (otherWords.length === 3) {
        const maskedSentence = sentence.replace(new RegExp(`\\b${targetWord}\\b`, 'i'), '_______');
        const options = [...otherWords, targetWord].sort(() => Math.random() - 0.5);
        const correctIndex = options.indexOf(targetWord);

        questions.push({
          id: `local-q-${index + 1}-${Date.now()}`,
          question: `Complete the core principle from the study material: "${maskedSentence}"`,
          options,
          correctIndex,
          explanation: `According to the source text: "${sentence}". Therefore, "${targetWord}" correctly completes the concept.`,
          difficulty: difficulty === 'mixed' ? (index % 3 === 0 ? 'hard' : 'medium') : difficulty,
          topic: 'Conceptual Principles',
        });
        index++;
      }
    }
  }

  return questions.slice(0, count);
}

/**
 * Generates a full practice examination locally
 */
export function generateLocalExam(
  documentTitle: string,
  rawText: string,
  questionCount = 10,
  timeLimitMinutes = 15
): PracticeExam {
  const questions = generateLocalQuiz(rawText, questionCount, 'mixed');
  const topics = Array.from(new Set(questions.map((q) => q.topic || 'General Material')));

  return {
    id: `local-exam-${Date.now()}`,
    title: `${documentTitle} Practice Examination`,
    description: `A timed diagnostic assessment evaluating key definitions, operational principles, and conceptual synthesis across ${documentTitle}.`,
    timeLimitMinutes,
    passingScorePercent: 70,
    topicsCovered: topics,
    questions,
    attempts: [],
  };
}
